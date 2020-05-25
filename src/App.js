import React, { Component } from "react";
//import ReactDOM from "react-dom";
import init3d from "./3d/init/init";

class App extends Component {
	componentDidMount() {
		init3d(this.mount);
	}
	render() {
		return (
			<div ref={ref => (this.mount = ref)} />
		)
	}
}
// const rootElement = document.getElementById("root");
// ReactDOM.render(<App />, rootElement);

export default App;	
