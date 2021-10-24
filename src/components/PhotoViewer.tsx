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
}


interface PhotoViewerState {
    albumsList?: JSX.Element,
    photosList?: JSX.Element,
    currentAlbumName?: string,
}

class PhotoViewer extends React.Component<ComponentProps, PhotoViewerState> {
    constructor(props) {
        super(props);
        this.state = {
            albumsList: undefined,
            photosList: undefined,
            currentAlbumName: undefined,
        };
    }

    render() {
        return (
            <div>
                {this.state.currentAlbumName ? this.state.photosList: this.state.albumsList}
            </div>
        );
    }

    async componentDidMount(): Promise<void> {
        if (this.state.currentAlbumName) {
            if (!this.state.photosList) {
                const photosList = await this.viewAlbum(this.state.currentAlbumName);
                this.setState((prevState) => ({
                    photosList: photosList,
                }));
            }
            return;
        } else if (this.state.albumsList) {
            return;
        } else {
            const albumsList = await this.listAlbums();
            this.setState((prevState) => {
                return ({
                    albumsList: albumsList,
                });
            });
            return;
        }
    }

    public async viewAlbum(albumName: string): Promise<JSX.Element> {
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
        const header = photos.length ? 'The following photosList are present' : 'There are no photosList in this album';
        const message = <p> {header} </p>;
        // document
        //     .getElementsByTagName("img")[0]
        //     .setAttribute("style", "display:none;");

        return (
            <div>
                <div>
                    {this.makeBackToAlbumsButton()}
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
                    {this.makeBackToAlbumsButton()}
                </div>
            </div>
        );
    }

    makeBackToAlbumsButton(): JSX.Element {
        return (
            <button
                onClick={async () => {
                    this.setState((prevState) => ({
                        currentAlbumName: undefined,
                    }));

                    return await this.listAlbums();
                }}
            >
                Back To albums
            </button>
        );
    }

    public async listAlbums(): Promise<JSX.Element> {
        const data = await s3.send(
            new ListObjectsCommand({Delimiter: '/', Bucket: bucket}),
        );
        return (
            <div>
                {
                    data.CommonPrefixes.map(
                        function(commonPrefix) {
                            const prefix = commonPrefix.Prefix;
                            const albumName = decodeURIComponent(prefix.replace('/', ''));
                            return (
                                <li key='album'>
                                    <button
                                        style={{margin: '5px'}}
                                        onClick={async () => {
                                            const photosList = await this.viewAlbum(albumName);
                                            this.setState((prevState) => ({
                                                currentAlbumName: albumName,
                                                photosList: photosList,
                                            }));
                                        }}
                                    >
                                        {albumName}
                                    </button>
                                </li>
                            );
                        },
                        this,
                    )
                }
            </div>
        );
    }
}

export {PhotoViewer};
