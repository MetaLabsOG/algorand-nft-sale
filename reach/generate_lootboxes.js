const Mustache = require('mustache');

const number_of_nfts = parseInt(process.argv[2])

const fun_arguments = Array(number_of_nfts).fill("Token").join(", ")
const tokens_list = Array(number_of_nfts).fill("token").map((curr, i) => curr = curr + i)
const tokens = tokens_list.join(", ")
const pay_amount_full = Array(number_of_nfts).fill("").map((curr, i) => curr = "[1, " + tokens_list[i] + "]");


function generate_assumes(t, i) {
  return Array(i).fill("").map((_, _i) => `assume(${t} !\= ${tokens_list[_i]});`)
}

const assumes = tokens_list.flatMap((t, i) => generate_assumes(t, i)).join('\n    ')

let view = {
  number_of_nfts,
  fun_arguments,
  tokens,
  pay_amount_full,
  assumes
}

const rsh_text = `
'reach 0.1';
'use strict';

const Common = {
  ...hasConsoleLogger,
  informTimeout: Fun([UInt], Null)
}

const CanClaim = {
  showNft: Fun([{{fun_arguments}}], Null),
  doOptIn: Fun([{{fun_arguments}}], Bool),
}

const nftPrice = 100000000
const timeoutSecs = 60

export const main = Reach.App(() => {
  /*============
    PARTICIPANTS
    ============*/
  const Seller = Participant('Seller', {
    ...Common,
    getNfts: Fun([], Tuple({{fun_arguments}})),
    disconnect: Fun([], Null),
  });

  const Winner = Participant('Winner', {
    ...Common,
    ...CanClaim,
    getSeller: Fun([], Address),
  });

  const Claimer = Participant('Claimer', {
    ...Common,
    ...CanClaim,
  });

  unstrict(() => {
    const Rescue = ParticipantClass('Rescue', {
      ...Common,
    });
  });

  /*=======
    HELPERS
    =======*/
  const doTimeout = (step) => (() => {
    Anybody.publish();
    transfer(balance()).to(Winner);
    each([Seller, Winner], () => {
      interact.informTimeout(step);
    });
    Claimer.interact.informTimeout(2);
    commit();
    exit();
  });

  /*========
    CONTRACT
    ========*/
  deploy();

  Winner.only(() => { 
    const seller = declassify(interact.getSeller());
  });
  Winner.publish(seller).pay(nftPrice*{{number_of_nfts}})
  Seller.set(seller);
  Claimer.set(Winner);
  commit();

  // -- BACKEND ONLY HERE
  Seller.only(() => {
    interact.log("1/3: publish ASAs")
    const [{{tokens}}]= declassify(interact.getNfts());
    {{{assumes}}}
  });
  Seller.publish({{tokens}})
    .timeout(relativeSecs(timeoutSecs), () => { doTimeout(0)(); });
  commit();
  Seller.interact.log("2/3: pay ASAs to contract")
  Seller.pay([{{pay_amount_full}}])
    .timeout(relativeSecs(timeoutSecs), () => { doTimeout(1)(); });
  commit();
  Seller.interact.disconnect();
  // -- END

  each([Winner, Claimer], () => {
    const optInResult = declassify(interact.doOptIn({{tokens}}));
  });

  race(Winner, Claimer).publish(optInResult)
  transfer([{{pay_amount_full}}]).to(Winner);
  commit();

  each([Winner, Claimer], () => interact.showNft({{tokens}}));

  // This is closeTo. It was aleady updated to this in Reach master branch, but not released yet.
  Anybody.publish();
  transfer(balance()).to(Seller);
  commit();
  exit();
});
`

const output = Mustache.render(rsh_text, view);

console.log(output)
