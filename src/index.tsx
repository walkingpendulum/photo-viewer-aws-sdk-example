import React from 'react';
import {render} from 'react-dom';
import {MyComponent} from './components/MyComponent';


render(
    (
        <div>
            <h1>Hello, world</h1>
            <MyComponent name='123'/>
        </div>
    ),
    document.getElementById('root'),
);
