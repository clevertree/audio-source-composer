import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    default: {
        display: 'flex',
    },

    header: {
        flexDirection:'row',
        backgroundColor: '#DDD',
        borderWidth: 1,
        borderLeftColor: '#FFF',
        borderTopColor: '#FFF',
        borderRightColor: '#AAA',
        borderBottomColor: '#AAA',

//     background: #DDD;
//     border: 1px outset #FFF;
    },

    id: {
        width: 40
    },

    name: {
        // width: 80
    },

    length: {
        marginLeft: 'auto',
        // width: 50,
    },

    container: {

    }
});




// /** ASPPlaylist **/
//
// div.asp-playlist {
//     display: inline-block;
//     /* width: 100%; */
//     /* max-width: 815px; */
// }
//
// div.asp-playlist > div.container {
//     width: 100%;
//     max-height: 800px;
//     /*overflow-y: overlay;*/
//     overflow-x: hidden;
// }
//
//
// div.asp-playlist > div.header,
// div.asp-playlist-entry {
//     display: flex;
//     /*justify-content: space-between;*/
//
//     flex-direction: row;
//     min-width: 49em;
//     background: #DDD;
//     border: 1px outset #FFF;
//     /* margin: 9px; */
//     cursor: pointer;
//     margin: 0px;
//     /* border-collapse: initial; */
// }
// /*div.asp-playlist > div.header > asui-div,*/
// /*aspp-entry > asui-div {*/
// /*     padding: 3px 0px;*/
// /*}*/
//
// div.asp-playlist > div.header > div.id,
// div.asp-playlist-entry > div.id {
//     display: inline-block;
//     width: 2.5em;
//     text-align: center;
//     margin-right: 1em;
// }
// div.asp-playlist > div.header > div.name,
// div.asp-playlist-entry > div.name {
//     display: inline-block;
// }
// div.asp-playlist > div.header > div.length,
// div.asp-playlist-entry > div.length {
//     /* display: inline-block; */
//     width: 4em;
//     /* align-items: flex-end; */
//     margin-left: auto;
// }
//
//
// /*asp-playlist div.asp-playlist-entry asui-div.id       { color: #000; }*/
// /*asp-playlist div.asp-playlist-entry div.asp-playlist-entry asui-div.id       { color: #555; }*/
//
//
// div.asp-playlist-entry {
//     background: #b9dabf;
//     padding: 4px 0px;
// }
//
//
// div.asp-playlist-entry:hover {
//     background: #998bda;
// }
//
// div.asp-playlist-entry.loaded {
//     background: #d4c4da;
// }
//
// div.asp-playlist-entry.loading {
//     background: #bfb9da;
// }
// div.asp-playlist-entry.position {
//     background: #9bbdff;
// }
// div.asp-playlist-entry.selected {
//     background: #AAA;
// }
