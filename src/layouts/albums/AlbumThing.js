import React, { Component } from "react";
import { connect } from "react-redux";
import { Icon, Header, Loader, Image } from "semantic-ui-react";
import { Grid, AutoSizer } from "react-virtualized";
import { serverAddress } from "../../api_client/apiClient";
import LazyLoad from "react-lazyload";
import { fetchThingAlbumsList } from "../../actions/albumsActions";
import { searchPhotos } from "../../actions/searchActions";
import { push } from "react-router-redux";
import store from "../../store";
import { Tile } from "../../components/Tile";

var topMenuHeight = 45; // don't change this
var SIDEBAR_WIDTH = 85;

export class AlbumThing extends Component {
  constructor() {
    super();
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
      entrySquareSize: 200,
    });
    this.calculateEntrySquareSize = this.calculateEntrySquareSize.bind(this);
    this.cellRenderer = this.cellRenderer.bind(this);
  }

  componentWillMount() {
    this.calculateEntrySquareSize();
    window.addEventListener("resize", this.calculateEntrySquareSize);
    if (this.props.albumsThingList.length === 0) {
      this.props.dispatch(fetchThingAlbumsList());
    }
  }

  componentWillUnount() {
    window.removeEventListener("resize", this.calculateEntrySquareSize);
  }

  calculateEntrySquareSize() {
    var numEntrySquaresPerRow = 6;
    if (window.innerWidth < 600) {
      numEntrySquaresPerRow = 2;
    } else if (window.innerWidth < 800) {
      numEntrySquaresPerRow = 3;
    } else if (window.innerWidth < 1000) {
      numEntrySquaresPerRow = 4;
    } else if (window.innerWidth < 1200) {
      numEntrySquaresPerRow = 5;
    }

    var columnWidth = window.innerWidth - SIDEBAR_WIDTH - 5 - 5 - 15;

    var entrySquareSize = columnWidth / numEntrySquaresPerRow;
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
      entrySquareSize: entrySquareSize,
      numEntrySquaresPerRow: numEntrySquaresPerRow,
    });
  }

  cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    var albumThingIndex =
      rowIndex * this.state.numEntrySquaresPerRow + columnIndex;
    if (albumThingIndex < this.props.albumsThingList.length) {
      return (
        <div key={key} style={style}>
          <div
            onClick={() => {
              store.dispatch(
                searchPhotos(this.props.albumsThingList[albumThingIndex].title)
              );
              store.dispatch(push("/search"));
            }}
            style={{ padding: 5 }}
          >
            {this.props.albumsThingList[albumThingIndex].cover_photos
              .slice(0, 1)
              .map((photo) => {
                return <Tile 
                        video = {photo.video === true} 
                        height = {this.state.entrySquareSize - 10}
                        width = {this.state.entrySquareSize - 10}
                        image_hash = {photo.image_hash}
                        ></Tile> 
              })}
          </div>
          <div style={{ paddingLeft: 15, paddingRight: 15, height: 50 }}>
            <b>{this.props.albumsThingList[albumThingIndex].title}</b>
            <br />
            {this.props.albumsThingList[albumThingIndex].photo_count} Photos
          </div>
        </div>
      );
    } else {
      return <div key={key} style={style} />;
    }
  };

  render() {
    return (
      <div>
        <div style={{ height: 60, paddingTop: 10 }}>
          <Header as="h2">
            <Icon name="tags" />
            <Header.Content>
              Things{" "}
              <Loader
                size="tiny"
                inline
                active={this.props.fetchingAlbumsThingList}
              />
              <Header.Subheader>
                Showing top {this.props.albumsThingList.length} things
              </Header.Subheader>
            </Header.Content>
          </Header>
        </div>

        <AutoSizer
          disableHeight
          style={{ outline: "none", padding: 0, margin: 0 }}
        >
          {({ width }) => (
            <Grid
              style={{ outline: "none" }}
              disableHeader={false}
              cellRenderer={this.cellRenderer}
              columnWidth={this.state.entrySquareSize}
              columnCount={this.state.numEntrySquaresPerRow}
              height={this.state.height - topMenuHeight - 60}
              rowHeight={this.state.entrySquareSize + 60}
              rowCount={Math.ceil(
                this.props.albumsThingList.length /
                  this.state.numEntrySquaresPerRow.toFixed(1)
              )}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

AlbumThing = connect((store) => {
  return {
    albumsThingList: store.albums.albumsThingList,
    fetchingAlbumsThingList: store.albums.fetchingAlbumsThingList,
    fetchedAlbumsThingList: store.albums.fetchedAlbumsThingList,
  };
})(AlbumThing);
