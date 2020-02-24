import React from "react";
import PropTypes from 'prop-types';

import './assets/Menu.css';
import MenuManager from "./MenuManager";

class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.onInputEventCallback = e => this.onInputEvent(e);
        this.state = {
            open: false,
            stick: false,
            options: null
        };
    }

    render() {
        let className = 'asui-menu asui-menu-container action';
        if(this.props.disabled)
            className += ' disabled';
        if(this.state.stick)
            className += ' stick';
        if(this.props.className)
            className += ' ' + this.props.className;

        const eventProps = this.getEventProps();

        return (
            <div
                // key={this.props.key}
                className={className}
                title={this.props.title}
                tabIndex={0}
                {...eventProps}
                >
                <div
                    className="title"
                    children={this.props.children}
                    />
                {this.props.arrow ? <div className="arrow">{this.props.arrow}</div> : null}
                {this.state.open ? <div
                    className="asui-menu-dropdown"
                >{this.state.options}</div> : null}
            </div>
            );
    }

    getEventProps() {
        return {
            onClick: this.onInputEventCallback,
            onKeyDown: this.onInputEventCallback,
        };
    }


    doMenuAction(e) {
        if(this.props.disabled) {
            console.warn("Menu is disabled.", this);
            return;
        }
        if(!this.props.onAction)
            throw new Error("prop onAction is missing");
        e.menu = this;
        const result = this.props.onAction(e, this);
        if(result !== false)
            MenuManager.closeAllMenus(e);
    }

    onInputEvent(e) {
        switch (e.type) {


            case 'click':
                if(!e.isDefaultPrevented()) {
                    e.preventDefault();
                    this.doMenuAction(e);
                }
                break;

            case 'keydown':

                let keyEvent = e.key;
                switch (keyEvent) {
                    case 'Escape':
                    case 'Backspace':
                        this.closeMenu(e);
                        break;

                    case 'Enter':
                        this.doMenuAction(e);
                        break;

                    // ctrlKey && metaKey skips a measure. shiftKey selects a range
                    case 'ArrowRight':
                        this.selectNextTabItem(e);
                        break;

                    case 'ArrowLeft':
                        this.selectPreviousTabItem(e);
                        break;

                    case 'ArrowDown':
                        this.selectNextTabItem(e);
                        break;

                    case 'ArrowUp':
                        this.selectPreviousTabItem(e);
                        break;

                    default:
                        console.log("Unknown key input: ", keyEvent);
                        break;

                }
                break;

            default:
                console.log("Unknown input event: ", e.type);
                break;
        }
    }
}

// creating default props
Menu.defaultProps = {
    arrow:          null, // '►',
    vertical:       false,
    openOnHover:    false,
    disabled:       false,
};

// validating prop types
Menu.propTypes = {
    onAction: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    vertical: PropTypes.bool,
    openOnHover: PropTypes.bool,
};



class MenuHorizontal extends Menu {}
Menu.Horizontal = MenuHorizontal;

/** Default props **/
MenuHorizontal.defaultProps = {
    arrow:          '▼',
    vertical:       true,
    openOnHover:    true,
    disabled:       false,
};

MenuHorizontal.propTypes = Menu.propTypes;



export {
    Menu as default,
    Menu,
    MenuHorizontal
};
