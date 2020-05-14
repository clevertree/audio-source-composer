import * as React from "react";
import PageContainer from "./page/PageContainer";
import Paragraph from "./component/paragraph/Paragraph";
import Link from "./component/link/Link";
import ImageLink from "./component/link/ImageLink";
import Header from "./component/header/Header";

import PageHeader from "./page/PageHeader";
import PageHeaderLinks from "./page/PageHeaderLinks";
import PageFooter from "./page/PageFooter";
import PageFooterLinks from "./page/PageFooterLinks";
import PageContent from "./page/PageContent";

export default class HomePage extends React.Component {
    render() {
        return <PageContainer>
            <PageHeader/>
            <PageHeaderLinks currentPath={this.props.location.pathname} />
            <PageContent>
                <Header>Introduction to Audio Source</Header>
                <Paragraph>
                    The Audio Source Composer is an
                    {' '}<Link href="https://github.com/clevertree/audio-source-composer">Open-Source</Link>{' '}
                    Digital Audio Workstation built on the
                    {' '}<Link href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API">WebAudioAPI</Link>{' '}
                    to work on all platforms from browsers to desktops to mobile devices.
                </Paragraph>

                <Header>Web Browser Demo (Alpha)</Header>
                <Paragraph>
                    Click the image below to try Audio Source Composer (Alpha) on your browser.
                </Paragraph>
                <ImageLink
                    href="/composer"
                    src={require("../assets/screenshots/browser-portrait1.png")}
                />

                <Header>Android Demo (Alpha)</Header>
                <Paragraph>
                    Click the image below for information on how to download Audio Source Composer Alpha Demo to your Android Device.
                </Paragraph>
                <ImageLink
                    href="/downloads"
                    src={require("../assets/screenshots/android-portrait1.png")}
                />

                <Header>iOS Demo (Unreleased)</Header>
                <Paragraph>
                    The iOS .ipa file can only be loaded into a pre-provisioned device, so no Alpha of iOS is available yet.
                    Contact me if you're interested in joining the Alpha/Beta testing loops.
                </Paragraph>
                <ImageLink
                    href="/downloads"
                    src={require("../assets/screenshots/ios-portrait1.png")}
                />

                <Header>Instruments</Header>
            </PageContent>
            <PageFooterLinks />
            <PageFooter />
        </PageContainer>;
    }
}

