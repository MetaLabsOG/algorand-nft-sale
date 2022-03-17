sudo rm -r build

for i in {1..8}
do
    node generate_lootboxes.js $i > "lootbox$i.rsh"
    echo "Compiling lootbox $i..."
    ./reach compile "lootbox$i.rsh"
    mv "build/lootbox$i.main.mjs" ../react/src/lootboxes/

    sudo rm "rpc/lootbox$i/index.rsh"
    mkdir -p "rpc/lootbox$i"
    mv "lootbox$i.rsh" "rpc/lootbox$i/index.rsh"
done

sudo rm -r build
