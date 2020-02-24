import React from 'react';

import {
    Button,
    Scrollable,
    Div,
    Menu,
    MenuBreak,
    SubMenu,
    Icon,
    MenuButton,
} from "../../../components";

import {Library} from "../../../song";
import InstrumentLoader from "../../InstrumentLoader";

import SynthesizerSampleRenderer from "./SynthesizerSampleRenderer";

import "./assets/SynthesizerRenderer.css";

/** AudioSourceSynthesizerRenderer **/
class SynthesizerRenderer extends React.Component {
    constructor(props) {
        super(props);
        const config = this.getConfig();
        this.state = {
            open: config.samples && config.samples.length > 0,
            library: Library.loadDefault()
        };
        if(config.libraryURL)
            this.changeLibrary(config.libraryURL);
    }

    getSong() { return this.props.song; }
    getConfig() { return this.getSong().getInstrumentConfig(this.props.instrumentID); }
    // getLibrary() { return this.state.library; }

    render() {
        const instrumentID = this.props.instrumentID;
        const instrumentIDHTML = (instrumentID < 10 ? "0" : "") + (instrumentID);

        const instrumentConfig = this.getConfig();



        // const instrument = this;
        // const instrumentID = typeof this.id !== "undefined" ? this.id : -1;
        // const config = song.getInstrumentConfig(instrumentID);

        // let presetURL = config.presetURL || '';
        // let presetTitle = presetURL.split('#').pop() || presetURL.split('/').pop() || 'Set Preset';
        // if(config.presetURL && config.preset)
        //     presetURL = new URL(config.libraryURL + '#' + config.preset, document.location) + '';

        // let titleHTML = `${instrumentIDHTML}: ${config.name || "Unnamed"}`;

        return (
            <Div className="audio-source-synthesizer-container">
                <Div className="header">
                    <Button
                        className="toggle-container"
                        onAction={e => this.toggleContainer(e)}
                        >{instrumentIDHTML}: {instrumentConfig.title || "Unnamed"}</Button>
                    {this.state.open ? <MenuButton
                        title="Change Preset"
                        className="instrument-preset"
                        options={e => this.openMenuChangePreset()}
                        onChange={(e, presetURL) => this.setPreset(presetURL)}
                        children={instrumentConfig.presetName || "No Preset"}
                        /> : null}
                    <MenuButton
                        arrow={false}
                        className="instrument-config"
                        options={e => this.openMenuRoot()}
                        >
                        <Icon className="config"/>
                    </MenuButton>
                </Div>
                {this.state.open && (
                    <Div className="samples">
                        {instrumentConfig.samples && instrumentConfig.samples.map((sampleData, sampleID) =>
                            <SynthesizerSampleRenderer
                                key={sampleID}
                                song={this.props.song}
                                instrumentID={this.props.instrumentID}
                                sampleID={sampleID}
                                sampleData={sampleData}
                            />
                        )}
                    </Div>
                )}
            </Div>
        );

    }

    openMenu(e, options) {
        this.props.openMenu(e, options);
    }

    openMenuRoot(e) {
        this.openMenu(e, <>
            <SubMenu onAction={e => this.openMenuChangePreset()}>Change Preset</SubMenu>
            <MenuBreak />
            <SubMenu onAction={e => this.openMenuChange(e)}>Change Instrument</SubMenu>
            <Menu onAction={e => this.instrumentRename(e)}>Rename Instrument</Menu>
            <Menu onAction={e => this.instrumentRemove(e)}>Remove Instrument</Menu>
        </>);
    }

    openMenuChange(e) {
        this.openMenu(e, <>
            {InstrumentLoader.getInstruments().map(config =>
                <Menu onAction={e => this.instrumentReplace(e, config.className)}>Change instrument to '{config.title}'</Menu>
            )}
        </>);
    }

    openMenuChangePreset(e) {
        let library = this.state.library;
        this.openMenu(e, <>
            <SubMenu onAction={e => this.openMenuLibraryList(e)}    >Libraries</SubMenu>
            <MenuBreak />
            <Menu disabled>Search</Menu>
            <MenuBreak />
            {library.getPresets().length > 0 ? (
                <Scrollable>
                    {library.getPresets().map(config => (
                        <Menu onAction={e => this.loadPreset(config.name)}>{config.name}</Menu>
                    ))}
                </Scrollable>
            ) : <Menu disabled> - Select a Library - </Menu>}
        </>);

        // selectElm.getOptGroup((library.name || 'Unnamed Library') + '', () =>
        //     library.getPresets().map(config => selectElm.getOption(config.url, config.name)),
        // ),
        //     selectElm.getOptGroup('Libraries', () =>
        //             library.getLibraries().map(config => selectElm.getOption(config.url, config.name)),
        //         {disabled: library.libraryCount === 0}
        //     ),
        //     selectElm.getOptGroup('Other Libraries', () =>
        //             Library.eachHistoricLibrary(config => selectElm.getOption(config.url, config.name)),
        //         {disabled: Library.historicLibraryCount === 0}
        //     ),
    }

    openMenuPresetList(e) {
        let library = this.state.library;
        // if(library.getPresets().length === 0)
        //     return <Menu disabled>No presets</Menu>;
        this.openMenu(e, library.getPresets().map(config => (
            <Menu>{config.name}</Menu>
        )));
    }

    openMenuLibraryList(e) {
        let library = this.state.library;
        return library.getLibraries().map(config => (
            <Menu onAction={e=>{this.changeLibrary(config.url); return false;}}>{config.name}</Menu>
        ));
    }


    instrumentReplace(e, instrumentClassName, instrumentConfig={}) {
        const instrumentID = this.props.instrumentID;
        instrumentConfig = InstrumentLoader.createInstrumentConfig(instrumentClassName, instrumentConfig);
        this.getSong().instrumentReplace(instrumentID, instrumentConfig);
    }
    instrumentRename(e) {
        const instrumentID = this.props.instrumentID;
        const instrumentConfig = this.getSong().getInstrumentConfig(instrumentID);
        const newName = window.prompt(`Rename instrument (${instrumentID}): `, instrumentConfig.title);
        this.getSong().instrumentRename(instrumentID, newName);
        // this.forceUpdate();
    }
    instrumentRemove(e) {
        const instrumentID = this.props.instrumentID;
        this.getSong().instrumentRemove(instrumentID);
    }

    async loadPreset(presetName) {
        const instrumentID = this.props.instrumentID;
        const presetConfig = this.state.library.getPresetConfig(presetName);
        const instrumentConfig = this.getSong().getInstrumentConfig(instrumentID);
        Object.assign(instrumentConfig, presetConfig);
        console.log('instrumentConfig', instrumentConfig);

        await this.getSong().instrumentReplace(instrumentID, instrumentConfig);
    }

    async changeLibrary(libraryURL) {
        const library = await Library.loadFromURL(libraryURL);
        this.setState({library});
    }

    toggleContainer() {
        this.setState({open: !this.state.open});
    }

    render2() {
        // return [
        //
        //     Div.createElement('header', () => [
        //         Button.createElement('title', titleHTML, e => this.toggleContainer(e)),
        //         this.selectChangePreset = new InputSelect('instrument-preset',
        //             (selectElm) => [
        //             ],
        //             (e, presetURL) => this.setPreset(presetURL),
        //             presetURL,
        //             presetTitle,
        //         ),
        //
        //         this.menu = Menu.createElement(
        //             {vertical: true},
        //             Icon.createIcon('config'),
        //             () => [
        //             ]
        //         ),
        //
        //         // new InputSelect('url',
        //         //     (e, changeInstrumentURL) => thisReplace(e, instrumentID, changeInstrumentURL),
        //         //     async (selectElm) =>
        //         //         instrumentLibrary.getInstruments().map((instrumentConfig) =>
        //         //             selectElm.getOption(instrumentConfig.url, instrumentConfig.name)),
        //         //     'Set Instrument'
        //         // )
        //     ]),
        //
        //     // this.buttonToggle = Button.createElement('instrument-id',
        //     //     e => this.form.classList.toggle('selected'),
        //     //     instrumentIDHTML + ':'
        //     // ),
        //     // this.textName = InputText.createElement('instrument-name',
        //     //     (e, newInstrumentName) => this.stateRename(newInstrumentName),
        //     //     'Instrument Name',
        //     //     this.config.name || '',
        //     //     'Unnamed'
        //     // ),
        //     // Button.createElement('instrument-remove',
        //     //     (e) => this.remove(e, instrumentID),
        //     //     Icon.createIcon('delete'),
        //     //     'Remove Instrument'),
        //
        //     (!this.state.open ? null : (
        //
        //         /** Sample Forms **/
        //         this.grid = new Grid('samples', () => [
        //             new GridRow('header', () => [
        //                 Div.createElement('id', 'ID'),
        //                 Div.createElement('url', 'URL'),
        //                 Div.createElement('mixer', 'Mixer'),
        //                 Div.createElement('detune', 'Detune'),
        //                 Div.createElement('root', 'Root'),
        //                 Div.createElement('alias', 'Alias'),
        //                 Div.createElement('loop', 'Loop'),
        //                 Div.createElement('adsr', 'ADSR'),
        //                 Div.createElement('remove', 'Rem'),
        //             ]),
        //
        //             samples.map((sampleData, sampleID) => new GridRow(sampleID, () => [
        //                 // const sampleRow = gridDiv.addGridRow('sample-' + sampleID);
        //                 // const sampleRow = this.form.addGrid(i);
        //                 // Div.createElement('name', (e, nameString) => this.setSampleName(sampleID, nameString), 'Name', sampleData.name);
        //                 // Button.createElement('id', (e) => this.moveSample(sampleID), sampleID, 'Sample ' + sampleID);
        //                 Div.createElement('id', sampleID),
        //
        //                 new InputSelect('url',
        //                     selectElm => library.eachSample(config => selectElm.getOption(config.url, config.name)),
        //                     async (e, sampleURL, sampleName) => {
        //                         await this.setSampleName(sampleID, sampleName);
        //                         await this.setSampleURL(sampleID, sampleURL);
        //                     },
        //                     sampleData.url,
        //                     sampleData.name),
        //
        //                 InputRange.createElement('mixer',
        //                     (e, mixerValue) => this.setSampleMixer(sampleID, mixerValue), 1, 100, 'Mixer', sampleData.mixer),
        //
        //                 InputRange.createElement('detune',
        //                     (e, detuneValue) => this.setSampleDetune(sampleID, detuneValue), -100, 100, 'Detune', sampleData.detune),
        //
        //                 new InputSelect('root',
        //                     selectElm => this.values.getNoteFrequencies(freq => selectElm.getOption(freq)),
        //                     (e, root) => this.setSampleKeyRoot(sampleID, root),
        //                     sampleData.root || ''),
        //                 // Menu.createElement({}, 'root',
        //                 //     selectElm => this.values.getNoteFrequencies(freq => {
        //                 //         new SelectMenu
        //                 //     }),
        //                 //     null,
        //                 //     'Root', sampleData.root || ''),
        //
        //                 new InputSelect('alias',
        //                     selectElm => this.values.getNoteFrequencies(freq => selectElm.getOption(freq)),
        //                     (e, keyAlias) => this.setSampleKeyAlias(sampleID, keyAlias),
        //                     sampleData.alias),
        //
        //                 new InputCheckBox('loop',
        //                     (e, isLoop) => this.setSampleLoop(sampleID, isLoop), 'Loop', sampleData.loop),
        //
        //                 InputText.createElement('adsr',
        //                     (e, asdr) => this.setSampleASDR(sampleID, asdr), 'ADSR', sampleData.adsr, '0,0,0,0'),
        //
        //                 Button.createElement('remove',
        //                     '&nbsp;X&nbsp;',
        //                     (e) => this.removeSample(sampleID),
        //                     'Remove sample'),
        //             ])),
        //
        //             new GridRow('footer', () => [
        //                 /** Add New Sample **/
        //                 Div.createElement('id', '*'),
        //                 this.fieldAddSample = new InputSelect('url',
        //                     (selectElm) => [
        //                         selectElm.getOption('', '[New Sample]'),
        //                         selectElm.getOptGroup((library.name || 'Unnamed Library') + '', () =>
        //                             library.eachSample(config => selectElm.getOption(config.url, config.name)),
        //                         ),
        //                         selectElm.getOptGroup('Libraries', () =>
        //                                 library.getLibraries().map(config => selectElm.getOption(config.url, config.name)),
        //                             {disabled: library.libraryCount === 0}
        //                         ),
        //                         selectElm.getOptGroup('Other Libraries', async () =>
        //                                 await Library.eachHistoricLibrary(config => selectElm.getOption(config.url, config.name)),
        //                             {disabled: Library.historicLibraryCount === 0}
        //                         ),
        //                     ],
        //                     (e, sampleURL, sampleName) => this.addSample(sampleURL, sampleName),
        //                     'Add Sample',
        //                     ''),
        //                 Div.createElement('id', '-'),
        //                 Div.createElement('id', '-'),
        //                 Div.createElement('id', '-'),
        //                 Div.createElement('id', '-'),
        //                 Div.createElement('id', '-'),
        //                 Div.createElement('id', '-'),
        //                 Div.createElement('id', '-'),
        //
        //             ]),
        //         ])
        //     ))
        //
        // ];
    }
}

export default SynthesizerRenderer;
