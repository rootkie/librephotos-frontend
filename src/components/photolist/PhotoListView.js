import React, { Component } from "react";
import Pig from "react-pig";
import "react-virtualized/styles.css"; // only needs to be imported once
import { connect } from "react-redux";
import { ModalAlbumEdit } from "../album/ModalAlbumEdit";
import { fetchPhotoDetail } from "../../actions/photosActions";
import { ModalPhotosShare } from "../sharing/ModalPhotosShare";
import { ModalAlbumShare } from "../sharing/ModalAlbumShare";
import {
  Dropdown,
  Header,
  Loader,
  Popup,
  Button,
  Icon,
  Grid,
  GridRow,
  GridColumn,
} from "semantic-ui-react";
import { serverAddress } from "../../api_client/apiClient";
import { LightBox } from "../lightbox/LightBox";
import _ from "lodash";
import getToolbar from "../photolist/Toolbar";

var TOP_MENU_HEIGHT = 45; // don't change this
var SIDEBAR_WIDTH = 85;
var TIMELINE_SCROLL_WIDTH = 0;

export class PhotoListView extends Component {
  constructor(props) {
    super(props);
    this.handleResize = this.handleResize.bind(this);
    this.getPhotoDetails = this.getPhotoDetails.bind(this);
    this.listRef = React.createRef();
    this.state = {
      selectedItems: [],
      lightboxImageIndex: 1,
      lightboxShow: false,
      lightboxSidebarShow: false,
      width: window.innerWidth,
      height: window.innerHeight,
      selectMode: false,
      modalAddToAlbumOpen: false,
      modalSharePhotosOpen: false,
      modalAlbumShareOpen: false,
      photosGroupedByDate: props.photosGroupedByDate, 
      nPhotos: props.idx2hash.length,
    };
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }
  componentDidUpdate(prevProps) {
    if (this.props != prevProps) {
        this.setState({
            photosGroupedByDate : this.props.photosGroupedByDate,
            nPhotos: this.props.idx2hash.length
        })
    }
  }

  handleSelection = (item) => {
    var newSelectedItems = this.state.selectedItems;
    if (newSelectedItems.find((selectedItem) => selectedItem.id === item.id)) {
      newSelectedItems = newSelectedItems.filter(
        (value) => value.id !== item.id
      );
    } else {
      newSelectedItems = newSelectedItems.concat(item);
    }
    this.setState({ selectedItems: newSelectedItems });
    this.setState({ selectMode: !newSelectedItems.length === 0 });
  };

  handleSelections = (items) => {
    var newSelectedItems = this.state.selectedItems;
    items.forEach((item) => {
      console.log(item);
      if (
        newSelectedItems.find((selectedItem) => selectedItem.id === item.id)
      ) {
        newSelectedItems = newSelectedItems.filter(
          (value) => value.id !== item.id
        );
      } else {
        newSelectedItems = newSelectedItems.concat(item);
      }
    });
    this.setState({ selectedItems: newSelectedItems });
    this.setState({ selectMode: !newSelectedItems.length === 0 });
  };

  handleClick = (event, item) => {
    //if an image is selectabel, then handle shift click
    if (event.shiftKey) {
      var lastSelectedElement = this.state.selectedItems.slice(-1)[0];
      if (lastSelectedElement === undefined) {
        this.handleSelection(item);
        return;
      }
      var indexOfCurrentlySelectedItem = this.props.idx2hash.findIndex(
        (image) => image.id === item.id
      );
      var indexOfLastSelectedItem = this.props.idx2hash.findIndex(
        (image) => image.id === lastSelectedElement.id
      );
      console.log(indexOfCurrentlySelectedItem);
      console.log(indexOfLastSelectedItem);
      if (indexOfCurrentlySelectedItem > indexOfLastSelectedItem) {
        this.handleSelections(
          this.props.idx2hash.slice(
            indexOfLastSelectedItem + 1,
            indexOfCurrentlySelectedItem + 1
          )
        );
        return;
      } else {
        this.handleSelections(
          this.props.idx2hash.slice(
            indexOfCurrentlySelectedItem,
            indexOfLastSelectedItem
          )
        );
        return;
      }
    }
    // if an image is already selected, then we are in selection mode
    if (this.state.selectedItems.length > 0) {
      this.handleSelection(item);
      return;
    }

    this.setState({
      lightboxImageIndex: this.props.idx2hash.findIndex(
        (image) => image.id === item.id
      ),
      lightboxShow: true,
    });
  };

  handleResize() {
    var columnWidth = window.innerWidth - 5 - 5 - 10;
    if (this.props.showSidebar) {
      columnWidth = window.innerWidth - SIDEBAR_WIDTH - 5 - 5 - 10;
    }

    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    if (this.listRef.current) {
      this.listRef.current.recomputeGridSize();
    }
  }

  getPhotoDetails(image) {
    this.props.dispatch(fetchPhotoDetail(image));
  }

  handleDeletePhotos(photoIds) {
    let newPhotos = []
    if (this.state.photosGroupedByDate[0].items) {
        newPhotos = this.state.photosGroupedByDate.map(cluster =>{return {...cluster, items: cluster.items.filter(el => !photoIds.includes(el.id))}})
    } else {
        newPhotos = this.state.photosGroupedByDate.filter(el => !photoIds.includes(el.id))
    }
    this.setState({
        photosGroupedByDate : newPhotos,
        nPhotos: this.state.nPhotos - photoIds.length
    })
  }

  render() {
    if (
      this.props.loading ||
      !this.state.photosGroupedByDate ||
      this.state.photosGroupedByDate.length < 1
    ) {
        
      return (
        <div>
          <div style={{ height: 60, paddingTop: 10 }}>
            <Header as="h4">
              <Header.Content>
                {this.props.loading ? "Loading..." : "No images found"}
                <Loader inline active={this.props.loading} size="mini" />
              </Header.Content>
            </Header>
          </div>

          {this.state.photosGroupedByDate &&
          this.state.photosGroupedByDate.length < 1 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: this.state.height - TOP_MENU_HEIGHT - 60,
              }}
            >
              <Header>{this.props.noResultsMessage}</Header>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      );
    }

    var isUserAlbum = false;
    if (this.props.route.location.pathname.startsWith("/useralbum/")) {
      isUserAlbum = true;
    }

    return (
      <div>
        <div
          style={{
            position: "sticky",
            top: TOP_MENU_HEIGHT - 9 /* required */,
            marginTop: 5,
            width: "100%",
            zIndex: 100,
            backgroundColor: "white",
          }}
        >
          <Grid columns={2}>
            <GridRow>
              <GridColumn>
                <Header as="h2" style={{ paddingRight: 10 }}>
                  <Icon name={this.props.titleIconName} />
                  <Header.Content>
                    {this.props.title}{" "}
                    <Header.Subheader>
                      {this.state.photosGroupedByDate.length != this.props.idx2hash.length ? (this.state.photosGroupedByDate.length +  " days, " ): ""}
                      {this.state.nPhotos} photos
                      {this.props.additionalSubHeader}
                    </Header.Subheader>
                  </Header.Content>
                </Header>
              </GridColumn>
              <GridColumn>
                <div
                  style={{
                    textAlign: "right",
                    margin: "0 auto",
                    padding: 20,
                  }}
                >
                  <span style={{ paddingLeft: 5, fontSize: 18 }}>
                    <b>
                    {this.props.dayHeaderPrefix
                      ? this.props.dayHeaderPrefix + this.props.date
                      : this.props.date}
                    {this.state.fromNow}
                    </b>
                  </span>
                </div>
              </GridColumn>
            </GridRow>
          </Grid>

          {true && !this.props.isPublic && (
            <div
              style={{
                marginLeft: -5,
                paddingLeft: 5,
                paddingRight: 5,
                height: 40,
                paddingTop: 4,
                backgroundColor: "#f6f6f6",
              }}
            >
              <Button.Group
                compact
                floated="left"
                style={{ paddingLeft: 2, paddingRight: 2 }}
              >
                <Popup
                  trigger={
                    <Button
                      icon="checkmark"
                      compact
                      active={this.state.selectMode}
                      color={this.state.selectMode ? "blue" : "null"}
                      onClick={() => {
                        this.setState({ selectMode: !this.state.selectMode });
                        if (this.state.selectMode) {
                          this.setState({ selectedItems: [] });
                        }
                      }}
                      label={{
                        as: "a",
                        basic: true,
                        content: `${this.state.selectedItems.length} selected`,
                      }}
                      labelPosition="right"
                    />
                  }
                  content="Toggle select mode"
                  inverted
                />
              </Button.Group>

              <Button.Group
                compact
                floated="left"
                style={{ paddingLeft: 2, paddingRight: 2 }}
              >
                <Popup
                  inverted
                  trigger={
                    <Button
                      icon
                      compact
                      positive={
                        this.state.selectedItems.length !==
                        this.props.idx2hash.length
                      }
                      negative={
                        this.state.selectedItems.length ===
                        this.props.idx2hash.length
                      }
                      onClick={() => {
                        if (
                          this.state.selectedItems.length ===
                          this.props.idx2hash.length
                        ) {
                          this.setState({ selectedItems: [] });
                        } else {
                          this.setState({
                            selectMode: true,
                            selectedItems: this.props.idx2hash,
                          });
                        }
                      }}
                    >
                      <Icon
                        name={
                          this.state.selectedItems.length ===
                          this.props.idx2hash.length
                            ? "check circle outline"
                            : "check circle"
                        }
                      />
                    </Button>
                  }
                  content={
                    this.state.selectedItems.length ===
                    this.props.idx2hash.length
                      ? "Deselect all"
                      : "Select All"
                  }
                />
              </Button.Group>
              {getToolbar(this)}
              <Button.Group
                style={{ paddingLeft: 2, paddingRight: 2}}
                floated="right"
                compact
                color="red"
              >
              <Button
                icon="trash"
                compact
                onClick={() => {
                  if (this.state.selectedItems.length > 0) {
                    this.handleDeletePhotos(this.state.selectedItems.map(el => el.id))
                  }
                }}
              />

              </Button.Group>
              <Button.Group
                style={{ paddingLeft: 2, paddingRight: 2 }}
                floated="right"
                compact
                color="teal"
              >
                <Dropdown
                  disabled={this.state.selectedItems.length === 0}
                  pointing="top right"
                  icon="plus"
                  floating
                  button
                  compact
                  floated="right"
                  className="icon"
                >
                  <Dropdown.Menu>
                    <Dropdown.Header>
                      Album ({this.state.selectedItems.length} selected)
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() => {
                        if (this.state.selectedItems.length > 0) {
                          this.setState({ modalAddToAlbumOpen: true });
                        }
                      }}
                    >
                      <Icon name="bookmark" color="red" />
                      {" Album"}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Button.Group>

              {false && isUserAlbum && (
                <Popup
                  inverted
                  trigger={
                    <Button.Group
                      style={{ paddingLeft: 2, paddingRight: 2 }}
                      floated="right"
                      compact
                      icon
                      onClick={() => {
                        this.setState({ modalAlbumShareOpen: true });
                      }}
                    >
                      <Button icon="share alternate" />
                    </Button.Group>
                  }
                  content="Share album"
                />
              )}
            </div>
          )}
        </div>
        {this.state.photosGroupedByDate ? (
          <div style={{ top: TOP_MENU_HEIGHT + 70 }}>
            <Pig
              imageData={
                !Array.isArray(this.state.photosGroupedByDate)
                  ? [this.state.photosGroupedByDate]
                  : this.state.photosGroupedByDate
              }
              selectable={true}
              selectedItems={this.state.selectedItems}
              handleSelection={this.handleSelection}
              handleClick={this.handleClick}
              groupByDate={this.props.isDateView}
              getUrl={(url, pxHeight) => {
                //console.log(pxHeight);
                if (pxHeight < 250) {
                  return (
                    serverAddress +
                    "/media/square_thumbnails_small/" +
                    url.split(";")[0]
                  );
                }
                return (
                  serverAddress +
                  "/media/square_thumbnails/" +
                  url.split(";")[0]
                );
              }}
            >
            </Pig>
          </div>
        ) : (
          <div></div>
        )}
        <div
          style={{
            backgroundColor: "white",
            position: "fixed",
            right: 0,
            top: TOP_MENU_HEIGHT,
            height: this.state.height - TOP_MENU_HEIGHT,
            width: TIMELINE_SCROLL_WIDTH,
          }}
        />

        {this.state.lightboxShow && (
          <LightBox
            isPublic={this.props.isPublic}
            showHidden={this.props.showHidden}
            idx2hash={this.props.idx2hash}
            lightboxImageIndex={this.state.lightboxImageIndex}
            onCloseRequest={() => this.setState({ lightboxShow: false })}
            onImageLoad={() => {
              console.log("Somebody calles me?");
              this.getPhotoDetails(
                this.props.idx2hash[this.state.lightboxImageIndex].id
              );
            }}
            onMovePrevRequest={() => {
              var prevIndex =
                (this.state.lightboxImageIndex +
                  this.props.idx2hash.length -
                  1) %
                this.props.idx2hash.length;
              this.setState({
                lightboxImageIndex: prevIndex,
              });
              this.getPhotoDetails(this.props.idx2hash[prevIndex].id);
            }}
            onMoveNextRequest={() => {
              var nextIndex =
                (this.state.lightboxImageIndex +
                  this.props.idx2hash.length +
                  1) %
                this.props.idx2hash.length;
              this.setState({
                lightboxImageIndex: nextIndex,
              });
              this.getPhotoDetails(this.props.idx2hash[nextIndex].id);
            }}
          />
        )}

        {!this.props.isPublic && (
          <ModalAlbumEdit
            isOpen={this.state.modalAddToAlbumOpen}
            onRequestClose={() => {
              this.setState({
                modalAddToAlbumOpen: false,
              });
            }}
            selectedImageHashes={this.state.selectedItems.map((i) => i.id)}
          />
        )}
        {!this.props.isPublic && (
          <ModalPhotosShare
            isOpen={this.state.modalSharePhotosOpen}
            onRequestClose={() => {
              this.setState({
                modalSharePhotosOpen: false,
              });
            }}
            selectedImageHashes={this.state.selectedItems.map((i) => i.id)}
          />
        )}
        {!this.props.isPublic && isUserAlbum && (
          <ModalAlbumShare
            isOpen={this.state.modalAlbumShareOpen}
            onRequestClose={() => {
              this.setState({
                modalAlbumShareOpen: false,
              });
            }}
            match={this.props.match}
            selectedImageHashes={this.state.selectedItems.map((i) => i.id)}
          />
        )}
      </div>
    );
  }
}

PhotoListView = connect((store) => {
  return {
    showSidebar: store.ui.showSidebar,
    gridType: store.ui.gridType,

    photos: store.photos.photos,
    fetchingPhotos: store.photos.fetchingPhotos,
    fetchedPhotos: store.photos.fetchedPhotos,

    photoDetails: store.photos.photoDetails,
    fetchingPhotoDetail: store.photos.fetchingPhotoDetail,
    fetchedPhotoDetail: store.photos.fetchedPhotoDetail,

    route: store.routerReducer,
  };
})(PhotoListView);
