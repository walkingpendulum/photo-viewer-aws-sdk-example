import React from 'react';


interface ComponentProps {
    name: string;
}

class MyComponent extends React.Component<ComponentProps> {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }
}

export {MyComponent};
