import React from "react";

import ASComposerContainer from "./container/ASComposerContainer";
import ASCTracksContainer from "./track/container/ASCTracksContainer";
import ASComposerSongPanel from "./panel/ASComposerSongPanel";
import ASComposerProgramPanel from "./panel/ASComposerProgramPanel";
import ASComposerInstructionPanel from "./panel/ASComposerInstructionPanel";
import ASComposerKeyboardPanel from "./panel/ASComposerKeyboardPanel";
import ASComposerTrackPanel from "./panel/ASComposerTrackPanel";

class ASComposerRenderer extends React.Component {
    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
        this.cb = {
            songPlay: () => this.songPlay(),
            songPause: () => this.songPause(),
            songStop: () => this.songStop(),
            loadSongFromFileInput: this.loadSongFromFileInput.bind(this),
            saveSongToFile: this.saveSongToFile.bind(this),
        }
    }

    /** TODO: Error Handling **/

    // static getDerivedStateFromError(error) {
    //     console.log('getDerivedStateFromError', error);
    //     this.setError(error);
    //     // Update state so the next render will show the fallback UI.
    //     return { hasError: false };
    // }
    // componentDidCatch(error, errorInfo) {
    //     console.log('componentDidCatch', error, errorInfo);
    //     this.setError(error);
    // }

    render() {
//         console.log('ASComposerRenderer.render()');
        return <ASComposerContainer
                    containerRef={this.containerRef}
                    composer={this}
                    >
                    {this.state.showPanelSong ? <ASComposerSongPanel composer={this} /> : null}
                    {this.state.showPanelProgram ? <ASComposerProgramPanel composer={this} /> : null}
                    {this.state.showPanelInstruction ? <ASComposerInstructionPanel composer={this} /> : null}
                    {this.state.showPanelTrack ? <ASComposerTrackPanel composer={this} /> : null}
                    {this.state.showPanelKeyboard ? <ASComposerKeyboardPanel composer={this} /> : null}


                    <ASCTracksContainer
                        composer={this}
                        />
                    {this.renderWebViewProxy()}
                </ASComposerContainer>;
    }


    /** Render WebView Proxy **/
    renderWebViewProxy() {
        return null;
    }

}


export default ASComposerRenderer
