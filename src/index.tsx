import React from 'react';
import {render} from 'react-dom';
import {PhotoViewer} from './components/PhotoViewer';


render(
    (
        <div>
            <h1>Hello, world</h1>
            <PhotoViewer name='123'/>
        </div>
    ),
    document.getElementById('root'),
);
