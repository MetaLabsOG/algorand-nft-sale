import React  from "react";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

function Image({link, width}) {
    return (
        <Zoom overlayBgColorEnd={"black"}>
            <img
                alt="NFT"
                src={link}
                width={width}
                height={width}
                style={{marginRight: "10px", display: "inline-block", borderRadius: "20px"}}
            />
        </Zoom>
    )
}

export function ImageGallery({face_link, full_link, side_link}) {
    return (
        <div className="image_gallery">
            <Image link={face_link} width={150} />
            <Image link={full_link} width={200} />
            <Image link={side_link} width={150} />
        </div>
    );
}

