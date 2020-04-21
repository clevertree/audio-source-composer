import React from "react";

import {Song, Storage, Instruction, ProgramLoader, NoteInstruction} from "../song";
import ComposerMenu from "./ComposerMenu";
import {Div} from "../components";
// import {TrackInfo} from "./tracker/";

class ComposerActions extends ComposerMenu {
    constructor(state = {}, props = {}) {
        super(state, props);
        this.onSongEventCallback = (e) => this.onSongEvent(e);
    }

    setStatus(newStatus) {
        console.info.apply(null, arguments); // (newStatus);
        this.setState({status: newStatus});
    }

    setError(newStatus) {
        this.setStatus(<Div className="error">{newStatus}</Div>);
    }

    setVersion(versionString) {
        this.setState({version: versionString});
    }

    /** Playback **/


    getAudioContext() {
        if (this.audioContext)
            return this.audioContext;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext = audioContext;
        return audioContext;
    }

    getVolumeGain() {
        if (!this.volumeGain) {
            const context = this.getAudioContext();
            let gain = context.createGain();
            gain.gain.value = this.state.volume; // Song.DEFAULT_VOLUME;
            gain.connect(context.destination);
            this.volumeGain = gain;
        }
        return this.volumeGain;
    }

    getVolume () {
        if(this.volumeGain) {
            return this.volumeGain.gain.value;
        }
        return this.state.volume;
    }
    setVolume (volume) {
        console.info("Setting volume: ", volume);
        const gain = this.getVolumeGain();
        if(gain.gain.value !== volume) {
            gain.gain.value = volume;
        }
        this.setState({volume});
        // this.state.volume = volume;
        this.fieldSongVolume.value = volume * 100;
    }

    /** Song actions **/


    async setSongName(e, newSongName=null) {
        if(newSongName === null)
            newSongName = await this.openPromptDialog("Enter a new song name", this.song.data.title);
        this.song.songChangeName(newSongName);
        this.setStatus(`Song name updated: ${newSongName}`);
    }

    setSongVersion(e, newSongVersion) {
        this.song.songChangeVersion(newSongVersion);
        this.setStatus(`Song version updated: ${newSongVersion}`);
    }

    songChangeStartingBPM(e, newSongBPM) {
        this.song.data.bpm = newSongBPM; // songChangeStartingBPM(newSongBPM);
        this.setStatus(`Song beats per minute updated: ${newSongBPM}`);
    }



    async openSongFromFileDialog(e, accept=null) {
        const file = await this.openFileDialog(accept);
        this.loadSongFromFileInput(e, file);
    }

    async loadSongFromFileInput(e, file=null, accept=null) {
        if(file === null)
            file = await this.openFileDialog(accept);
        if (!file)
            throw new Error("Invalid file input");
        const song = await Song.loadSongFromFileInput(file);
        this.setCurrentSong(song);
        // await this.song.loadSongFromFileInput(file);
        // this.render();
    }


    /** Song utilities **/


    loadNewSongData() {
        // const storage = new Storage();
        // const defaultProgramURL = this.getDefaultProgramClass() + '';
        // let songData = storage.generateDefaultSong(defaultProgramURL);
        // const song = Song.loadSongFromData(songData);
        const song = new Song(this.audioContext);
        this.setCurrentSong(song);
        // this.forceUpdate();
        this.setStatus("Loaded new song", song.getProxiedData());
    }


    loadRecentSongData() {
        const storage = new Storage();
        let songRecentUUIDs = storage.getRecentSongList();
        if (songRecentUUIDs[0] && songRecentUUIDs[0].uuid) {
            this.setStatus("Loading recent song: " + songRecentUUIDs[0].uuid);
            this.loadSongFromMemory(songRecentUUIDs[0].uuid);
            return true;
        }
        return false;
    }


    loadSongFromMemory(songUUID) {
        const song = Song.loadSongFromMemory(this.audioContext, songUUID);
        this.setCurrentSong(song);
        this.setStatus("Song loaded from memory: " + songUUID, this.song, this.state);
//         console.info(songData);
    }

    loadSongFromURL(url) {
        const song = Song.loadSongFromURL(this.audioContext, url);
        this.setCurrentSong(song);
        this.setStatus("Loaded from url: " + url);
    }

    saveSongToMemory() {
        const song = this.song;
        const songData = song.data;
        const songHistory = song.history;
        const storage = new Storage();
        this.setStatus("Saving song to memory...");
        storage.saveSongToMemory(songData, songHistory);
        this.setStatus("Saved song to memory: " + songData.uuid);
    }

    saveSongToFile() {
        const songData = this.song.data;
        // const songHistory = this.song.history;
        const storage = new Storage();
        this.setStatus("Saving song to file");
        storage.saveSongToFile(songData);
    }


//         async loadSongFromMemory(songUUID) {
//             await this.song.loadSongFromMemory(songUUID);
//             this.forceUpdate();
//             this.setStatus("Song loaded from memory: " + songUUID);
// //         console.info(songData);
//         }
//
//         async loadSongFromFileInput(fileInput = null) {
//             fileInput = fileInput || this.fieldSongFileLoad.inputElm;
//             if (!fileInput || !fileInput.files || fileInput.files.length === 0)
//                 throw new Error("Invalid file input");
//             if (fileInput.files.length > 1)
//                 throw new Error("Invalid file input: only one file allowed");
//             const file = fileInput.files[0];
//             await this.song.loadSongFromFileInput(file);
//             this.forceUpdate();
//             this.setStatus("Song loaded from file: ", file);
//         }
//
//
//
//         async loadSongFromURL(url=null, promptUser=true) {
//             if (promptUser)
//                 url = await this.openPromptDialog("Enter a Song URL:", url || 'https://mysite.com/songs/mysong.json');
//             await this.song.loadSongFromURL(url);
//             this.setStatus("Song loaded from url: " + url);
//             // console.info(this.song.data);
//             this.forceUpdate();
//         }
//
//         async loadSongFromData(songData) {
//             await this.song.loadSongData(songData);
//             // this.render(true);
//             this.setStatus("Song loaded from data", songData);
//             this.forceUpdate();
//         }

    /** Song Playback Position **/

    updateSongPositionValue(songPosition) {
        this.setState({songPosition});
    }

    /** Song Playback **/

    async songPlay() {
        await this.song.play(this.getVolumeGain());
    }

    async songPause() {
        this.song.stopPlayback();
    }

    async songStop() {
        if (this.song.playback)
            this.song.stopPlayback();
        this.song.setPlaybackPositionInTicks(0);
    }

    async setSongPosition(playbackPosition, promptUser=false) {
        // const wasPlaying = !!this.song.playback;
        // if (wasPlaying)
        //     this.song.stopPlayback();
        const song = this.song;
        // if (playbackPosition === null)
        //     playbackPosition = this.values.parsePlaybackPosition(this.fieldSongPosition.value);
        if(promptUser)
            playbackPosition = await this.openPromptDialog("Set playback position:", playbackPosition || '00:00:00');

        song.setPlaybackPosition(playbackPosition);
        // if (wasPlaying)
        //     this.song.play();
    }

    /** Instruction Modification **/


    async instructionInsert(newCommand = null, promptUser = false) {
        const trackName = this.state.selectedTrack;
        const activeTracks = {...this.state.activeTracks};
        const trackState = activeTracks[trackName];
        // if (programID !== null)
        //     newInstruction.program = programID;

        //: TODO: check for recursive group
        const song = this.song;
        // let selectedIndices = this.getSelectedIndices();

        // if(selectedIndices.length === 0)
        //     throw new Error("No selection");
        if (newCommand === null)
            newCommand = trackState.currentCommand;
        if (promptUser)
            newCommand = await this.openPromptDialog("Set custom command:", newCommand || '');
        if (!newCommand)
            throw new Error("Invalid Instruction command");

        const newInstruction = Instruction.parseInstruction([0, newCommand]);
        trackState.currentCommand = newInstruction.command;
        if(trackState.currentDuration)
            newInstruction.durationTicks = trackState.currentDuration;
        if(trackState.currentVelocity)
            newInstruction.velocity = trackState.currentVelocity;
        this.setState({activeTracks});

        const songPositionTicks = this.trackerGetTrackInfo(trackName).calculateCursorOffsetPositionTicks();
        let insertIndex = song.instructionInsertAtPosition(trackName, songPositionTicks, newInstruction);
        this.trackerSelectIndices(trackName, [insertIndex]);

        this.instructionPlaySelected();
    }

    async instructionReplaceCommandSelectedPrompt(newCommand = null) {
        if (newCommand === null)
            newCommand = this.state.activeTracks[this.state.selectedTrack].currentCommand;
        newCommand = await this.openPromptDialog("Set custom command:", newCommand || '');
        return this.instructionReplaceCommandSelected(newCommand);
    }

    instructionReplaceCommandSelected(newCommand, trackName=null, selectedIndices=null) {
        const song = this.song;
        if(trackName === null)
            trackName = this.state.selectedTrack;
        const trackInfo = this.state.activeTracks[trackName];
        if(selectedIndices === null)
            selectedIndices = trackInfo.selectedIndices || []; // .getSelectedIndices();

        if (selectedIndices.length === 0)
            throw new Error("No selection");
        // if (newCommand === null)
        //     newCommand = trackInfo.track.currentCommand;
        if (!newCommand)
            throw new Error("Invalid Instruction command");

        // this.setState({currentTrackerCommand: newCommand});
        for (let i = 0; i < selectedIndices.length; i++) {
            song.instructionReplaceCommand(trackName, selectedIndices[i], newCommand);
        }

        this.instructionPlaySelected();
        // trackInfo.updateCurrentInstruction();
    }
    // }

    async instructionReplaceDuration(duration = null, promptUser = false) {
        const song = this.song;
        const trackInfo = this.trackerGetSelectedTrackInfo();
        const selectedIndices = trackInfo.getSelectedIndices();

        if (duration === null && promptUser)
            duration = parseInt(await this.openPromptDialog("Set custom duration in ticks:", duration), 10);
        if (isNaN(duration))
            throw new Error("Invalid duration: " + typeof duration);
        for (let i = 0; i < selectedIndices.length; i++) {
            const instruction = song.instructionGetByIndex(trackInfo.getTrackName(), selectedIndices[i]);
            instruction.durationTicks = duration;
        }
        this.instructionPlaySelected();
        trackInfo.updateCurrentInstruction();
    }

    async instructionReplaceVelocity(velocity = null, promptUser = false) {
        const song = this.song;
        const trackInfo = this.trackerGetSelectedTrackInfo();
        const selectedIndices = trackInfo.getSelectedIndices();

        if (velocity === null && promptUser)
            velocity = parseInt(await this.openPromptDialog("Set custom velocity (0-127):", this.fieldInstructionVelocity.value));
        velocity = parseFloat(velocity);
        if (velocity === null || isNaN(velocity))
            throw new Error("Invalid velocity: " + typeof velocity);
        for (let i = 0; i < selectedIndices.length; i++) {
            const instruction = song.instructionGetByIndex(trackInfo.getTrackName(), selectedIndices[i]);
            instruction.velocity = velocity;
        }
        this.instructionPlaySelected();
        trackInfo.updateCurrentInstruction();
    }

    instructionDelete() {
        const song = this.song;
        const {trackName, selectedIndices} = this.trackerGetActiveSelectedTrackState();

        for (let i = 0; i < selectedIndices.length; i++)
            song.instructionDeleteAtIndex(trackName, selectedIndices[i]);

    }

    /** Keyboard Commands **/

    keyboardChangeOctave(keyboardOctave = null) {
        if (!Number.isInteger(keyboardOctave))
            throw new Error("Invalid segment ID");
        this.setState({keyboardOctave});
    }


    /** Track State **/

    /** @deprecated **/
    trackerGetActiveSelectedTrackState() {
        return this.trackerGetActiveTrackState(this.state.selectedTrack);
    }

    /** @deprecated **/
    trackerGetActiveTrackState(trackName) {
        if(typeof this.state.activeTracks[trackName] === "undefined")
            throw new Error("Invalid active track: " + trackName);
        const trackState = this.state.activeTracks[trackName];
        let selectedIndices = trackState.selectedIndices || [];

        return {
            trackState,
            trackName,
            selectedIndices,
        }
    }

    /** Track Info **/

    // /** @deprecated **/
    // trackerGetTrackInfo(trackName) {
    //     return new TrackInfo(trackName, this);
    // }
    // trackerGetSelectedTrackInfo() {
    //     const trackName = this.state.selectedTrack;
    //     return new TrackInfo(trackName, this);
    // }

    /** Tracker Playback **/

    /** Playback **/


    instructionPlaySelected(trackName=null, stopPlayback=true) {
        if(trackName === null)
            trackName = this.state.selectedTrack;
        const track = this.state.activeTracks[trackName];
        return this.instructionPlay(trackName, track.selectedIndices, stopPlayback);
    }
    instructionPlay(trackName, selectedIndices, stopPlayback=true) {
        const track = this.state.activeTracks[trackName];

        const song = this.getSong();
        if(stopPlayback && song.isPlaying())
            song.stopPlayback();

        let destination = this.getVolumeGain(); // TODO: get track destination


        // destination = destination || this.getDestination();
        if(!Array.isArray(selectedIndices))
            selectedIndices = [selectedIndices];
        // console.log('playInstructions', selectedIndices);
        const programID = typeof track.programID !== "undefined" ? track.programID : 0;

        // if(stopPlayback)
        //     song.programLoader.stopAllPlayback();

        for(let i=0; i<selectedIndices.length; i++) {
            const selectedIndex = selectedIndices[i];
            const instruction = song.instructionGetByIndex(trackName, selectedIndex);
            song.playInstruction(destination, instruction, programID);
        }
    }


    /** Tracker Commands **/

    async trackAdd(newTrackName = null, promptUser = true) {
        const song = this.song;

        newTrackName = newTrackName || song.generateInstructionTrackName();
        if(promptUser)
            newTrackName = await this.openPromptDialog("Create new instruction group?", newTrackName);
        if (newTrackName) {
            song.trackAdd(newTrackName, []);
            this.trackerToggleTrack(newTrackName, true);
        } else {
            this.setStatus("<span class='error'>Create instruction group canceled</span>");
        }
    }

    async trackRename(oldTrackName, newTrackName = null, promptUser = true) {
        const song = this.song;

        if(promptUser)
            newTrackName = await this.openPromptDialog(`Rename instruction group (${oldTrackName})?`, oldTrackName);
        if (newTrackName !== oldTrackName) {
            song.trackRename(oldTrackName, newTrackName);
            this.trackerToggleTrack(newTrackName, true);
            this.trackerToggleTrack(oldTrackName, false);
        } else {
            this.setStatus("<span class='error'>Rename instruction group canceled</span>");
        }
    }

    async trackRemove(trackName, promptUser = true) {
        const song = this.song;

        const result = promptUser ? await this.openPromptDialog(`Remove instruction group (${trackName})?`) : true;
        if (result) {
            song.trackRemove(trackName);
            this.trackerToggleTrack(trackName, true);
        } else {
            this.setStatus("<span class='error'>Remove instruction group canceled</span>");
        }

    }


    trackerToggleTrack(trackName = null, toggleValue=null, trackData={}) {
        const activeTracks = {...this.state.activeTracks};
        let selectedTrack = trackName;
        if(toggleValue === true || typeof activeTracks[trackName] === "undefined") {
            const currentTrackData = activeTracks[this.state.selectedTrack];
            activeTracks[trackName] = Object.assign({}, currentTrackData, trackData);
        } else {
            trackData = activeTracks[trackName];
            if(trackData.destinationList)
                selectedTrack = trackData.destinationList.slice(-1)[0]; // Select last track
            else
                selectedTrack = this.getSong.getStartTrackName();
            delete activeTracks[trackName];
        }
        this.setState({activeTracks, selectedTrack});
    }

    trackerChangeQuantization(trackName, trackerQuantizationTicks) {
        if (!trackerQuantizationTicks || !Number.isInteger(trackerQuantizationTicks))
            throw new Error("Invalid quantization value");
        this.setState(state => {
            state.activeTracks[trackName].quantizationTicks = trackerQuantizationTicks;
            return state;
        });
    }

    async trackerChangeQuantizationPrompt(trackName) {
        const trackerQuantizationTicks = await this.composer.openPromptDialog(`Enter custom tracker quantization in ticks:`, this.track.quantizationTicks);
        this.trackerChangeQuantization(trackName, trackerQuantizationTicks)
    }


    trackerChangeSegmentLength(trackName, trackerSegmentLengthInRows = null) {
        if (!trackerSegmentLengthInRows || !Number.isInteger(trackerSegmentLengthInRows))
            throw new Error("Invalid tracker row length value");
        this.setState(state => {
            state.activeTracks[trackName].rowLength = trackerSegmentLengthInRows;
            return state;
        });
    }

    async trackerChangeSegmentLengthPrompt(trackName) {
        const trackerSegmentLengthInRows = parseInt(await this.composer.openPromptDialog(`Enter custom tracker segment length in rows:`, this.track.rowLength));
        this.trackerChangeSegmentLength(trackName, trackerSegmentLengthInRows);
    }

    /** Selection **/

    async trackerSelectIndices(trackName, selectedIndices, cursorOffset=null, rowOffset=null) {
        // console.log('trackerSelectIndices', {trackName, selectedIndices, cursorOffset, rowOffset});
        // TODO: get song position by this.props.index
        // let selectedIndices = await this.composer.openPromptDialog("Enter selection: ", oldSelectedIndices.join(','));
        if (typeof selectedIndices === "string") {
            switch (selectedIndices) {
                case 'all':
                    selectedIndices = [];
                    const maxLength = this.song.instructionFindGroupLength(this.trackName);
                    for (let i = 0; i < maxLength; i++)
                        selectedIndices.push(i);
                    break;
                case 'segment':
                    selectedIndices = [].map.call(this.querySelectorAll('asct-instruction'), (elm => elm.index));
                    break;
                case 'row':
                    throw new Error('TODO');
                case 'none':
                    selectedIndices = [];
                    break;
                default:
                    selectedIndices = selectedIndices.split(/[^0-9]/).map(index => parseInt(index));
                    // throw new Error("Invalid selection: " + selectedIndices);
            }
        }

        if (typeof selectedIndices === 'number')
            selectedIndices = [selectedIndices];
        if (!Array.isArray(selectedIndices))
            throw new Error("Invalid selection: " + selectedIndices);

        selectedIndices.forEach((index, i) => {
            if(typeof index !== "number")
                throw new Error(`Invalid selection index (${i}): ${index}`);
        });

        // Filter unique indices
        selectedIndices = selectedIndices.filter((v, i, a) => a.indexOf(v) === i && v !== null);
        // Sort indices
        selectedIndices.sort((a, b) => a - b);
        // console.info('ComposerActions.trackerSelectIndices', trackName, selectedIndices);


        await new Promise(resolve => this.setState(state => {
            state.selectedTrack = trackName;
            const track = state.activeTracks[trackName];
            track.selectedIndices = selectedIndices;
            if(cursorOffset !== null)
                track.cursorOffset = cursorOffset;
            if(rowOffset !== null)
                track.rowOffset = rowOffset;

            // If selected, update default instruction params
            if(selectedIndices.length > 0) {
                const firstSelectedInstruction = this.getSong().instructionGetByIndex(trackName, selectedIndices[0]);
                track.currentCommand = firstSelectedInstruction.command;
                if(firstSelectedInstruction instanceof NoteInstruction) {
                    if(typeof firstSelectedInstruction.durationTicks !== "undefined")
                        track.currentDuration = firstSelectedInstruction.getDurationString(track.timeDivision || this.getSong().data.timeDivision);
                    if(typeof firstSelectedInstruction.velocity !== "undefined")
                        track.currentVelocity = firstSelectedInstruction.velocity;
                }
            }
            return state;
        }, resolve));
        return selectedIndices;
    }



    async trackerSetCursorOffset(trackName, newCursorOffset, selectedIndices=[]) {
        if (!Number.isInteger(newCursorOffset))
            throw new Error("Invalid cursor offset");
        if(newCursorOffset < 0)
            throw new Error("Cursor offset must be >= 0");
        return await this.trackerSelectIndices(trackName, selectedIndices, newCursorOffset);
    }

    trackerSetRowOffset(trackName, newRowOffset) {
        if (!Number.isInteger(newRowOffset))
            throw new Error("Invalid row offset");
        this.setState(state => {
            state.activeTracks[trackName].rowOffset = newRowOffset;
            return state;
        });
    }


    // trackerUpdateCurrentInstruction(trackName) {
    //     this.setState(state => {
    //         const track = state.activeTracks[trackName];
    //         const selectedIndices = track.selectedIndices;
    //         if(selectedIndices.length > 0) {
    //             const firstSelectedInstruction = this.getSong().instructionGetByIndex(this.getTrackName(), selectedIndices[0]);
    //             track.currentCommand = firstSelectedInstruction.command;
    //             if(firstSelectedInstruction instanceof NoteInstruction) {
    //                 if(typeof firstSelectedInstruction.durationTicks !== "undefined")
    //                     track.currentDuration = firstSelectedInstruction.getDurationString(this.getStartingTimeDivision());
    //                 if(typeof firstSelectedInstruction.velocity !== "undefined")
    //                     track.currentVelocity = firstSelectedInstruction.velocity;
    //             }
    //         }
    //         return state;
    //     });
    //
    // }

    /** @deprecated **/
    trackerCalculateRowOffset(trackName, cursorOffset=null) {
        return this.trackerGetTrackInfo(trackName).calculateRowOffset(trackName, cursorOffset);
    }

    /** @deprecated **/
    trackerFindCursorRow(trackName, cursorOffset=null) {
        return this.trackerGetTrackInfo(trackName).findCursorRow(trackName, cursorOffset);
    }





    /** Context menu **/
    // async openContextMenu(e) {
    //     const contextMenu = this.menuContext;
    //     await contextMenu.openContextMenu(e);
    // }

    /** Programs **/


    async programAdd(programClassName, programConfig = {}, promptUser=false) {
        if (!programClassName)
            throw new Error(`Invalid program class`);
        const {title} = ProgramLoader.getProgramClassInfo(programClassName);
        // programConfig = ProgramLoader.createProgramConfig(programClassName, programConfig);
        // programConfig.libraryURL = this.defaultLibraryURL;
        // programConfig.name = programConfig.name || programURL.split('/').pop();

//         e.target.form.elements['programURL'].value = '';
        if (promptUser === false || await this.openConfirmDialog(`Add '${title}' to Song?`)) {
            const programID = this.song.programAdd(programConfig);
            this.setStatus(`New program class '${programClassName}' added to song at position ${programID}`);
            // this.forceUpdate();
            // this.fieldInstructionProgram.setValue(programID);
            // await this.panelPrograms.forceUpdate();

        } else {
            this.setError(`New program canceled: ${programClassName}`);
        }
    }

    async programReplace(programID, programClassName, programConfig = {}) {
        if (!Number.isInteger(programID))
            throw new Error(`Invalid Program ID: Not an integer`);
        if (!programClassName)
            throw new Error(`Invalid Program class`);

        if (await this.openPromptDialog(`Change Program (${programID}) to ${programClassName}`)) {
            await this.song.programReplace(programID, programClassName, programConfig);
            this.setStatus(`Program (${programID}) changed to: ${programClassName}`);

        } else {
            this.setError(`Change program canceled: ${programClassName}`);
        }
    }

    async programRename(programID, newProgramTitle = null) {
        console.log(this.song.programGetConfig(programID).title, programID);
        const oldProgramTitle = this.song.programGetConfig(programID).title;
        if (!newProgramTitle)
            newProgramTitle = await this.openPromptDialog(`Change name for programs ${programID}: `, oldProgramTitle);
        if (!newProgramTitle)
            return console.error("Program name change canceled");
        this.song.programRename(programID, newProgramTitle);
        this.setStatus(`Program title updated: ${newProgramTitle}`);
    }

    async programRemove(programRemoveID = null) {
        if (await this.openConfirmDialog(`Remove Program ID: ${programRemoveID}`)) {
            this.song.programRemove(programRemoveID);
            this.setStatus(`Program (${programRemoveID}) removed`);

        } else {
            this.setError(`Remove program canceled`);
        }
    }


    /** Toggle Panels **/

    togglePanelPrograms() {
        this.classList.toggle('hide-panel-programs');
    }

    togglePanelTracker() {
        this.classList.toggle('hide-panel-tracker');
    }

    togglePanelSong() {
        this.classList.toggle('hide-panel-song');
    }

    toggleFullscreen() {
        const setFullScreen = !this.classList.contains('fullscreen');
        this.classList.toggle('fullscreen', setFullScreen);
    }

    /** Tools **/



    async batchSelect(e, searchCallbackString = null, promptUser = false) {
        if (promptUser || !searchCallbackString)
            searchCallbackString = await this.openPromptDialog("Run custom search:", searchCallbackString ||
                `/** Example Search **/ i.command === "C3"   &&   i.program === 0`);
        if (!searchCallbackString)
            throw new Error("Batch command canceled: Invalid search");

        const storage = new Storage();
        storage.addBatchRecentSearches(searchCallbackString);

        throw new Error("TODO Implement");
        // const tracker = this.tracker;
        // this.clearselectedIndices();
        // const trackName = tracker.getTrackName();
        // try {
        //     const stats = {count: 0};
        //     const iterator = this.song.instructionGetIterator(trackName);
        //     let instruction;
        //     while (instruction = iterator.nextConditionalInstruction((instruction) => {
        //         const i = instruction;
        //         const window = null, document = null;
        //         return eval(searchCallbackString);
        //     })) {
        //         stats.count++;
        //         tracker.selectIndicies(e, iterator.currentIndex);
        //     }
        //     this.setStatus("Batch Search Completed: " + JSON.stringify(stats), stats);
        // } catch (err) {
        //     this.setStatus("Batch Search Failed: " + err.message, err);
        // }
    }

    async batchRunCommand(e, commandCallbackString = null, searchCallbackString = null, promptUser = false) {
        const storage = new Storage();

        if (promptUser || !searchCallbackString)
            searchCallbackString = await this.openPromptDialog("Run custom search:", searchCallbackString ||
                `/** Example Search **/ i.command === "C3"   &&   i.program === 0`);
        if (!searchCallbackString)
            throw new Error("Batch command canceled: Invalid search");
        storage.addBatchRecentSearches(searchCallbackString);


        if (promptUser || !commandCallbackString)
            commandCallbackString = await this.openPromptDialog(`Run custom command:`, commandCallbackString ||
                `/** Example Command **/ i.command='C4';`);
        if (!commandCallbackString)
            throw new Error("Batch command canceled: Invalid command");
        storage.addBatchRecentCommands(commandCallbackString);

        throw new Error("TODO Implement");
        // const instructionList = [];
        // const tracker = this.tracker;
        // const trackName = tracker.getTrackName(), g = trackName;
        // try {
        //     const stats = {count: 0, modified: 0};
        //     const iterator = this.song.instructionGetIterator(trackName);
        //     let instruction;
        //     const window = null, document = null;
        //     while (instruction = iterator.nextConditionalInstruction((instruction) => {
        //         const i = instruction;
        //         return eval(searchCallbackString);
        //     })) {
        //         const instructionString = JSON.stringify(instruction.data);
        //         const i = instruction;
        //         eval(commandCallbackString);
        //         if (instructionString !== JSON.stringify(instruction.data))
        //             stats.modified++;
        //
        //         stats.count++;
        //         tracker.selectIndex(e, iterator.currentIndex);
        //     }
        //     this.setStatus("Batch Command Completed: " + JSON.stringify(stats), stats);
        //     return instructionList;
        // } catch (err) {
        //     this.setStatus("Batch Command Failed: " + err.message, err);
        //     return [];
        // }
    }


    /** Prompt **/

    openPromptDialog(message, defaultValue='') {
        return window.prompt(message, defaultValue);
    }

    async openFileDialog(accept=null) {
        return await new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            if(accept)
                input.setAttribute('accept', accept);
            input.addEventListener('change', () => {
                const file = input.files[0];
                if(file)
                    resolve(file);
                else
                    reject();
            });
            input.click();
        })
    }

}


export default ComposerActions;
