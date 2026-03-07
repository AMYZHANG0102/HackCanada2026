import React, { useState } from "react";

export default function UploadImage() {
    const [imageUrl, setImageUrl] = useState("");

    const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const file = event.target.files[0];

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "react_upload");

        const res = await fetch(
            "https://api.cloudinary.com/v1_1/tarifsmaple/image/upload",
            {
                method: "POST",
                body: data,
            }
        );

        const result = await res.json();
        setImageUrl(result.secure_url);
    };

    return (
        <div>
            <input type="file" onChange={uploadImage} />

            {imageUrl && (
                <img src={imageUrl} alt="uploaded" width="300" />
            )}
        </div>
    );
}
