import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    default: {
        display: 'flex',
        flexDirection:'row',
        flexWrap:'wrap',

        backgroundColor: '#C0C0C0',
        borderWidth: 1,
        borderLeftColor: '#DDD',
        borderTopColor: '#DDD',
        borderRightColor: '#AAA',
        borderBottomColor: '#AAA',
        // padding: 2,
    },

    position: {

    },
    selected: {

    },
    cursor: {

    },

    'measure-start': {
        borderTopWidth: 1,
        borderTopColor: '#666',
    }
});


// /** ASCTrack Row **/
//
// div.asct-row {
//     display: flex;
//     cursor: pointer;
//     background-color: #C0C0C0;
//     height: 1.45em;
//     position: relative;
//     border: 1px outset #DDD;
//     padding: 0px;
// }
//
//
// div.asct-row:nth-child(odd) {
//     background-color: #D0D0D0;
// }
//
// /** Track Colors **/
//
// div.asct-row.measure-start {
//     border-top: 1px solid #666;
//     background: linear-gradient(to bottom, #AAA 0%, #CCC 50%);
// }
//
// div.asct-row.playing {
//     background-color: #4ebf4e;
// }
//
// div.asct-row.position {
//     background-color: #609060;
// }
//
//
// /** Selected **/
//
// div.asct-row.cursor,
// div.asct-row.selected {
//     background-color: #ffeedd;
//     position: relative;
//     box-shadow: #ffeedd 0px 0px 9px;
//     z-index: 2;
// }
//
// /** Hover **/
//
// div.asct-row:hover {
//     background: #EFE;
//     border: 1px outset #4EE;
// }
//
// div.asct-row.position:hover {
//     background: #9C9;
//     border: 1px outset #4EE;
// }
