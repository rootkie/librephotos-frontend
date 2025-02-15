import _ from "lodash";
import React, { Component } from "react";
import './TopMenu.css';
import { connect } from "react-redux";
import { push } from "react-router-redux";
import {
  Menu,
  Button,
  Dropdown,
  Icon,
  Image,
  Input,
  Popup,
  Progress,
} from "semantic-ui-react";
import { logout } from "../../actions/authActions";
import { toggleSidebar } from "../../actions/uiActions";
import { CustomSearch } from "../CustomSearch";
import {
  fetchCountStats,
  fetchWorkerAvailability,
} from "../../actions/utilActions";
import { serverAddress } from "../../api_client/apiClient";
import { fetchUserSelfDetails } from "../../actions/userActions";

export class TopMenu extends Component {
  state = {
    width: window.innerWidth,
    avatarImgSrc: "/unknown_user.jpg",
  };

  constructor(props) {
    super(props);
    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    this.setState({ width: window.innerWidth });
  }

  componentDidMount() {
    this.props.dispatch(fetchCountStats());
    this.props.dispatch(fetchUserSelfDetails(this.props.auth.access.user_id));

    var _dispatch = this.props.dispatch;
    this.setState({ dispatch: _dispatch });
    var intervalId = setInterval(() => {
      _dispatch(fetchWorkerAvailability(this.props.workerRunningJob));
    }, 2000);
    this.setState({ intervalId: intervalId });
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize.bind(this));
    clearInterval(this.state.intervalId);
  }

  render() {
    if (this.state.avatarImgSrc === "/unknown_user.jpg") {
      console.log(this.state.avatarImgSrc);
      if (this.props.userSelfDetails && this.props.userSelfDetails.avatar_url) {
        console.log(serverAddress + this.props.userSelfDetails.avatar_url);
        this.setState({
          avatarImgSrc: serverAddress + this.props.userSelfDetails.avatar_url,
        });
      }
    }

    let runningJobPopupProgress = null;
    if (
      this.props.workerRunningJob &&
      this.props.workerRunningJob.result &&
      this.props.workerRunningJob.result.progress
    ) {
      runningJobPopupProgress = (
        <div style={{ width: 150 }}>
          <Progress
            indicating
            progress
            percent={(
              (this.props.workerRunningJob.result.progress.current.toFixed(2) /
                this.props.workerRunningJob.result.progress.target) *
              100
            ).toFixed(0)}
          >
            Running {this.props.workerRunningJob.job_type_str} ...
          </Progress>
        </div>
      );
    }

    return (
      <div>
        <Menu
          style={{ contentAlign: "left", backgroundColor: "#eeeeee" }}
          fixed="top"
          borderless
          size="mini"
          fluid
        >
          <Menu.Menu position="left">
            <Menu.Item>
              <Icon
                size="big"
                onClick={() => {
                  this.props.dispatch(toggleSidebar());
                }}
                name={"sidebar"}
              />
              <Button
                color="black"
                style={{
                  padding: 2,
                }}
              >
                <Image height={30} src="/logo-white.png" />
              </Button>
            </Menu.Item>
          </Menu.Menu>
          <Menu.Menu 
          className="header" style={{ paddingTop: 2 }}>
              <CustomSearch className="element" />
          </Menu.Menu>
          <Menu.Menu position="right">
            <Menu.Item>
              <Popup
                trigger={
                  <Icon
                    name="circle"
                    color={!this.props.workerAvailability ? "red" : "green"}
                  />
                }
                position="bottom right"
                offset={[13, 0]}
                content={
                  this.props.workerAvailability
                    ? "Worker available! You can start scanning more photos, infer face labels, auto create event albums, or regenerate auto event album titles."
                    : !this.props.workerAvailability &&
                      this.props.workerRunningJob
                    ? runningJobPopupProgress
                    : "Busy..."
                }
              />

              <Dropdown
                trigger={
                  <span>
                    <Image avatar src={this.state.avatarImgSrc} />
                    <Icon name="caret down" />
                  </span>
                }
                icon={null}
              >
                <Dropdown.Menu>
                  <Dropdown.Header>
                    Logged in as {this.props.auth.access.name}
                  </Dropdown.Header>
                  <Dropdown.Item onClick={() => this.props.dispatch(logout())}>
                    <Icon name="sign out" />
                    <b>Logout</b>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => this.props.dispatch(push("/settings"))}
                  >
                    <Icon name="settings" />
                    <b>Settings</b>
                  </Dropdown.Item>
                  {this.props.auth.access.is_admin && <Dropdown.Divider />}

                  {this.props.auth.access.is_admin && (
                    <Dropdown.Item
                      onClick={() => this.props.dispatch(push("/admin"))}
                    >
                      <Icon name="wrench" />
                      <b>Admin Area</b>
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </div>
    );
  }
}

TopMenu = connect((store) => {
  return {
    showSidebar: store.ui.showSidebar,
    gridType: store.ui.gridType,

    workerAvailability: store.util.workerAvailability,
    workerRunningJob: store.util.workerRunningJob,

    auth: store.auth,
    jwtToken: store.auth.jwtToken,
    exampleSearchTerms: store.util.exampleSearchTerms,
    fetchingExampleSearchTerms: store.util.fetchingExampleSearchTerms,
    fetchedExampleSearchTerms: store.util.fetchedExampleSearchTerms,
    searchError: store.search.error,
    searchingPhotos: store.search.searchingPhotos,
    searchedPhotos: store.search.searchedPhotos,
    people: store.people.people,
    fetchingPeople: store.people.fetchingPeople,
    fetchedPeople: store.people.fetchedPeople,

    albumsThingList: store.albums.albumsThingList,
    fetchingAlbumsThingList: store.albums.fetchingAlbumsThingList,
    fetchedAlbumsThingList: store.albums.fetchedAlbumsThingList,

    albumsUserList: store.albums.albumsUserList,
    fetchingAlbumsUserList: store.albums.fetchingAlbumsUserList,
    fetchedAlbumsUserList: store.albums.fetchedAlbumsUserList,

    albumsPlaceList: store.albums.albumsPlaceList,
    fetchingAlbumsPlaceList: store.albums.fetchingAlbumsPlaceList,
    fetchedAlbumsPlaceList: store.albums.fetchedAlbumsPlaceList,
    userSelfDetails: store.user.userSelfDetails,
  };
})(TopMenu);
