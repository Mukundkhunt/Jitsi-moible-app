import React, { Component } from 'react';
import {
    Image,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import RtcEngine, {
    RtcLocalView,
    RtcRemoteView,
    VideoRenderMode,
    ClientRole,
    ChannelProfile,
    VideoRemoteState,
} from 'react-native-agora';
import Icon from 'react-native-vector-icons/Ionicons'
import IconF from 'react-native-vector-icons/Feather'
import requestCameraAndAudioPermission from '../../component/Permission';
import styles from './style';
import { showAlertMessage, showErrorAlertMessage, validateEmail } from '../../helper/Global'
import * as actions from '../../actions';
import { connect } from 'react-redux';
import ShareScreen from '../ShareScreen';
import ShareScreenUser from '../ShareScreenUser';
import { bucketURL, socket } from '../../helper/ApiConstant';
import Header from '../../component/Header';

/**
 * @property appId Agora App ID
 * @property token Token for the channel;
 * @property channelName Channel Name for the current session
 */
let Data = [
    {
        name: '',
    },
    {
        name: '',
    },
    {
        name: '',
    },
    {
        name: '',
    },
    {
        name: '',
    },
    {
        name: '',
    },
]

const appId = '9f2a15f3856d48a983e9930fbc5d3c86';
let channelName, token;
/**
 * @property isHost Boolean value to select between broadcaster and audience
 * @property joinSucceed State variable for storing success
 * @property peerIds Array for storing connected peers
 */
// interface State {
//   isHost: boolean;
//   joinSucceed: boolean;
//   peerIds: number[];
// }

class VideoStreaming extends Component {
    _engine;
    constructor(props) {
        channelName = props.route.params?.channelName;
        token = props.route.params?.token
        super(props);
        this.state = {
            isHost: true,
            joinSucceed: false,
            peerIds: [],
            isvideo: true,
            qustionSetId: [],
            qustions: [],
            channelId: props.route.params?.channelId,
            isAudio: true,
            isShare: false,
            qustionLength: 0
        };


    }

    componentDidMount = async () => {
        socket.on('get_question', async (data) => {
            // this.state.qustions.push({ question: data.question })
            await this._engine?.enableLocalAudio(false);
            await this._engine?.enableLocalVideo(false);
            this.setState({ qustions: data.question, isShare: true, isvideo: false, isAudio: false, qustionLength: data?.questionsLength })
        })

        socket.on('stop_question', async (data) => {
            // this.state.qustions.push({ question: data.question })
            this.setState({ isShare: false })
        })

        socket.on('buzzer_pressed', async (data) => {
            showAlertMessage({
                title: data.message,
                type: 'success',
            });
        })


        this.init();
    }

    /**
     * @name init
     * @description Function to initialize the Rtc Engine, attach event listeners and actions
     */
    init = async () => {
        const { getQustionSetById, userData } = this.props
        let token1 = userData?.token
        this._engine = await RtcEngine.create(appId);
        await this._engine.enableVideo();
        await this._engine?.setChannelProfile(ChannelProfile.LiveBroadcasting);
        await this._engine?.setClientRole(
            this.state.isHost ? ClientRole.Broadcaster : ClientRole.Audience
        );

        this._engine.addListener('Warning', (warn) => {
            // console.log('Warning', warn);
        });

        this._engine.addListener('Error', (err) => {
            console.log('Error', err);
        });

        this._engine.addListener('UserJoined', (uid, elapsed) => {
            console.log('UserJoined', uid, elapsed);
            // Get current peer IDs
            const { peerIds } = this.state;
            // If new user
            if (peerIds.indexOf(uid) === -1) {
                this.setState({
                    // Add peer ID to state array
                    peerIds: [...peerIds, { id: uid, video: true }],
                });
            }
        });

        this._engine.addListener('UserOffline', (uid, reason) => {
            console.log('UserOffline', uid, reason);
            const { peerIds } = this.state;
            this.setState({
                // Remove peer ID from state array
                peerIds: peerIds.filter((id) => id.id !== uid),
            });
        });

        // If Local user joins RTC channel
        this._engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
            console.log('JoinChannelSuccess', channel, uid, elapsed);
            // Set state variable to true
            this.setState({
                joinSucceed: true,
            });
        });

        this._engine.addListener('RemoteVideoStateChanged', (uid, state, reason, elapsed) => {
            if (state == VideoRemoteState.Stopped) {
                this.state.peerIds.map((item, index) => {
                    if (item.id === uid) {
                        this.state.peerIds[index].video = false,
                            this.setState({})
                    }
                })
            }

            if (state == VideoRemoteState.Starting) {
                this.state.peerIds.map((item, index) => {
                    if (item.id === uid) {
                        this.state.peerIds[index].video = true,
                            this.setState({})
                    }
                })
            }
            if (state == VideoRemoteState.Decoding) {
                this.state.peerIds.map((item, index) => {
                    if (item.id === uid) {
                        this.state.peerIds[index].video = true,
                            this.setState({})
                    }
                })
            }
            if (state == VideoRemoteState.Frozen) {
                this.state.peerIds.map((item, index) => {
                    if (item.id === uid) {
                        this.state.peerIds[index].video = true,
                            this.setState({})
                    }
                })
            }
        })
        this.startCall();
    };
    startCall = async () => {
        // Join Channel using null token and channel name
        await this._engine?.joinChannel(token, channelName, null, 0);
    };

    /**
     * @name endCall
     * @description Function to end the call
     */
    endCall = async () => {
        // await this._engine?.enableLocalVideo(false);
        // this.setState({ isvideo: false })

        this.setState({ peerIds: [], joinSucceed: false });
        this.props.navigation.goBack();
    };

    muteMic = async () => {
        await this._engine?.enableLocalAudio(!this.state.isAudio);
        this.setState({ isAudio: !this.state.isAudio })
    }
    muteVideo = async () => {
        console.log(this.state.isvideo)
        await this._engine?.enableLocalVideo(!this.state.isvideo);
        this.setState({ isvideo: !this.state.isvideo })
    }

    render() {
        const { userData } = this.props
        return (
            <View style={styles.max}>
                <>
                    {this.state.isShare ?
                        <>
                            <ShareScreenUser questions={this.state.qustions} userData={this.props.userData} channelId={this.state.channelId} addAnswer={this.props.addAnswer} questionsLength={this.state.qustionLength} />
                            {this._renderRemoteVideos()}
                        </>
                        :
                        <>
                            {!this.state.isvideo ?
                                <>
                                    <Header
                                        isBack={true}
                                        title={'Meeting Name'}
                                        isRight={true}
                                        isVideo={true}
                                        audioName={this.state.isAudio ? 'mic-outline' : 'mic-off-outline'}
                                        videoName={this.state.isvideo ? 'video' : 'video-off'}
                                        micPress={() => this.muteMic()}
                                        videoPress={() => this.muteVideo()}
                                    />
                                    <Image
                                        source={{ uri: bucketURL + userData?.image }}
                                        style={styles.imageStyle}
                                    />
                                    {this._renderRemoteVideos()}
                                </>
                                :
                                <>
                                    {this._renderVideos()}
                                </>
                            }
                        </>
                    }
                </>
            </View>
        );
    }

    _renderVideos = () => {
        const { joinSucceed } = this.state;
        return joinSucceed ? (
            <View style={styles.fullView}>
                {this.state.isHost ? (
                    this.state.isvideo ?
                        <RtcLocalView.SurfaceView
                            style={styles.max}
                            channelId={channelName}
                            renderMode={VideoRenderMode.Hidden}
                        />
                        :
                        <View style={styles.adminBackground} ></View>
                ) : (
                    <></>
                )}
                {this._renderButton()}
            </View>
        ) : null;
    };

    _renderRemoteVideos = () => {
        const { peerIds } = this.state;
        return (
            <ScrollView
                style={styles.remoteContainer}
                contentContainerStyle={styles.remoteContainerContent}
                horizontal={true}
            >
                {peerIds.map((value) => {
                    return (
                        <>
                            {value.video ?
                                <RtcRemoteView.SurfaceView
                                    style={styles.remote1}
                                    uid={value.id}
                                    channelId={channelName}
                                    renderMode={VideoRenderMode.Fit}
                                    zOrderMediaOverlay={true}
                                />
                                :
                                <View style={styles.remote} ></View>
                            }
                        </>
                    );
                })}
            </ScrollView>
        );
    };

    _renderButton = () => {
        return (
            <View style={styles.bottomButton} >
                <TouchableOpacity style={styles.lastButton1} onPress={() => this.muteMic()} >
                    <Icon name={this.state.isAudio ? 'mic-outline' : 'mic-off-outline'} size={20} color={'white'} style={{ alignSelf: 'center' }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.middleButton} onPress={() => this.muteVideo()} >
                    <IconF name={this.state.isvideo ? 'video' : 'video-off'} size={17} color={'white'} style={{ alignSelf: 'center' }} />
                </TouchableOpacity>
            </View>
        )
    }

}

const mapStateToProps = ({ auth: { userData } }) => ({
    userData,
});
export default connect(mapStateToProps, actions)(VideoStreaming);
