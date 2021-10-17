import React, {JSXElementConstructor} from 'react';
import {CognitoIdentityClient} from '@aws-sdk/client-cognito-identity';
import {fromCognitoIdentityPool} from '@aws-sdk/credential-provider-cognito-identity';
const { S3Client, ListObjectsCommand } = require("@aws-sdk/client-s3");
import { region, identityPoolId, bucket } from "../config";



interface ComponentProps {
    name: string;
}

class PhotoViewer extends React.Component<ComponentProps> {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }

    async viewAlbum(albumName: string): Promise<JSX.Element> {
        const albumPhotosKey = `${encodeURIComponent(albumName)}/`;
        try {
            const data = await s3.send(
                new ListObjectsCommand({
                    Prefix: albumPhotosKey,
                    Bucket: bucket,
                })
            );
        } catch (error) {
            console.log(error);
            throw error;
        }
        const bucketUrl = `https://s3.${region}.amazonaws.com/${bucket}/`
        const photos = data.Contents.map(function (photo) {
            const photoKey = photo.Key;
            const photoUrl = bucketUrl + encodeURIComponent(photoKey);
            return (
                <span>
                    <div>
                        <br/>
                        <img
                            style={{width:'128px', height: '128px'}}
                            src={photoUrl}
                        />
                    </div>
                    <div>
                        <span>
                            {photoKey.replace(albumPhotosKey, '')}
                        </span>
                    </div>
                </span>
            )
        });
        const photosHeader = photos.length ? 'The following photos are present' : 'There are no photos in this album';
        const message = <p> {photosHeader} </p>

        return (
            <div>
                <div>
                    <button
                        onClick={() = null} // listAlbums
                    >
                        Back To albums
                    </button>
                </div>
                <h2>
                    `Album: ${albumName}`
                </h2>
                {message}
                <div>
                    {photos}
                </div>
                <h2>
                    {`End of album: ${albumName}`}
                </h2>
                <div>
                    <button
                        onclick={() => null}    // listAlbums
                    >
                        Back To albums
                    </button>
                </div>
            </div>
        )
    }

    const viewAlbum2 = async (albumName) => {
        try {
            // var albumPhotosKey = encodeURIComponent(albumName) + "/";
            // const data = await s3.send(
            //     new ListObjectsCommand({
            //         Prefix: albumPhotosKey,
            //         Bucket: bucket,
            //     })
            // );
            // var href = "https://s3." + region + ".amazonaws.com/";
            // var bucketUrl = href + bucket + "/";
            // var photos = data.Contents.map(function (photo) {
            //     var photoKey = photo.Key;
            //     var photoUrl = bucketUrl + encodeURIComponent(photoKey);
            //     return getHtml([
            //         "<span>",
            //         "<div>",
            //         "<br/>",
            //         '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
            //         "</div>",
            //         "<div>",
            //         "<span>",
            //         photoKey.replace(albumPhotosKey, ""),
            //         "</span>",
            //         "</div>",
            //         "</span>",
            //     ]);
            // });
            // var message = photos.length
            //     ? "<p>The following photos are present.</p>"
            //     : "<p>There are no photos in this album.</p>";
            var htmlTemplate = [
                "<div>",
                '<button onclick="listAlbums()">',
                "Back To albums",
                "</button>",
                "</div>",
                "<h2>",
                "Album: " + albumName,
                "</h2>",
                message,
                "<div>",
                getHtml(photos),
                "</div>",
                "<h2>",
                "End of album: " + albumName,
                "</h2>",
                "<div>",
                '<button onclick="listAlbums()">',
                "Back To albums",
                "</button>",
                "</div>",
            ];
            document.getElementById("viewer").innerHTML = getHtml(htmlTemplate);
            document
                .getElementsByTagName("img")[0]
                .setAttribute("style", "display:none;");
        } catch (err) {
            return alert("There was an error viewing your album: " + err.message);
        }
    };
}


const s3 = new S3Client({
    region,
    credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region }),
        identityPoolId,
    }),
});


export {PhotoViewer};
