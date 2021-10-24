import React from 'react';
import {CognitoIdentityClient} from '@aws-sdk/client-cognito-identity';
import {fromCognitoIdentityPool} from '@aws-sdk/credential-provider-cognito-identity';
import {bucket, identityPoolId, region} from '../config';

const {S3Client, ListObjectsCommand} = require('@aws-sdk/client-s3');


const s3 = new S3Client({
    region: region,
    credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({region: region}),
        identityPoolId: identityPoolId,
    }),
});


interface ComponentProps {
    name: string,
}


interface PhotoViewerState {
    albums: JSX.Element,
}

class PhotoViewer extends React.Component<ComponentProps, PhotoViewerState> {
    constructor(props) {
        super(props);
        this.state = {
            albums: props.albums,
        };
    }

    render() {
        return (
            <div>
                <h1>
                    Hello, {this.props.name}
                </h1>
                <div>
                    {this.state.albums}
                </div>
            </div>
        );
    }

    async componentDidMount() {
        const albums = await this.listAlbums();
        albums.key;
        this.setState((prevState) => ({albums: albums}));
    }

    async viewAlbum(albumName: string): Promise<JSX.Element> {
        const albumPhotosKey = `${encodeURIComponent(albumName)}/`;
        let data;
        try {
            data = await s3.send(
                new ListObjectsCommand({
                    Prefix: albumPhotosKey,
                    Bucket: bucket,
                }),
            );
        } catch (error) {
            console.log(error);
            throw error;
        }
        if (!data) {
            console.log(`Failed to list album folder ${albumPhotosKey}`);
            return <div>Error occurred</div>;
        }
        const bucketUrl = `https://s3.${region}.amazonaws.com/${bucket}/`;
        const photos = data.Contents.map(function(photo) {
            const photoKey = photo.Key;
            const photoUrl = bucketUrl + encodeURIComponent(photoKey);
            return (
                <span key={''}>
                    <div>
                        <br/>
                        <img
                            alt={''}
                            style={{width: '128px', height: '128px'}}
                            src={photoUrl}
                        />
                    </div>
                    <div>
                        <span>
                            {photoKey.replace(albumPhotosKey, '')}
                        </span>
                    </div>
                </span>
            );
        });
        const photosHeader = photos.length ? 'The following photos are present' : 'There are no photos in this album';
        const message = <p> {photosHeader} </p>;
        // document
        //     .getElementsByTagName("img")[0]
        //     .setAttribute("style", "display:none;");

        return (
            <div>
                <div>
                    <button
                        onClick={async () => {
                            return await this.listAlbums();
                        }}
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
                        onClick={async () => {
                            return await this.listAlbums();
                        }}
                    >
                        Back To albums
                    </button>
                </div>
            </div>
        );
    }

    async listAlbums(): Promise<JSX.Element> {
        const data = await s3.send(
            new ListObjectsCommand({Delimiter: '/', Bucket: bucket}),
        );

        return data.CommonPrefixes.map(function(commonPrefix) {
            const prefix = commonPrefix.Prefix;
            const albumName = decodeURIComponent(prefix.replace('/', ''));
            return (
                <li key='album'>
                    <button
                        style={{margin: '5px'}}
                        onClick={async () => {
                            return await this.viewAlbum(albumName);
                        }}
                    >
                        {albumName}
                    </button>
                </li>
            );
        });
    }
}

export {PhotoViewer};
