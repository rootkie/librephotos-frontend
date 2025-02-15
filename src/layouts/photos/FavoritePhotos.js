
import React, { Component } from 'react';
import { connect } from "react-redux";
import { fetchFavoritePhotos } from '../../actions/photosActions';
import moment from 'moment'
import _ from 'lodash'
import { PhotoListView } from '../../components/photolist/PhotoListView'

export class FavoritePhotos extends Component {
  
  componentDidMount() {
    this.props.dispatch(fetchFavoritePhotos())
  }


  render() {
    const {fetchingFavoritePhotos} = this.props
    const changedStuff = this.props.favoritePhotos;
    changedStuff.forEach(
      (group) => (group.date = moment(group.date).format("MMM Do YYYY, dddd") !== "Invalid date" ?  moment(group.date).format("MMM Do YYYY, dddd") : group.date)
    );
    return (
      <PhotoListView 
        showHidden={false}
        title={"Favorite Photos"}
        loading={fetchingFavoritePhotos}
        titleIconName={'star'}
        isDateView={true}
        photosGroupedByDate={changedStuff}
        idx2hash={changedStuff.flatMap((el)=>el.items)}
      />
    )  
  }
}

FavoritePhotos = connect((store)=>{
  return {
    favoritePhotos: store.photos.favoritePhotos,
    fetchingFavoritePhotos: store.photos.fetchingFavoritePhotos,
    fetchedFavoritePhotos: store.photos.fetchedFavoritePhotos,

    albumsPeople: store.albums.albumsPeople,
    fetchingAlbumsPeople: store.albums.fetchingAlbumsPeople,
    fetchedAlbumsPeople: store.albums.fetchedAlbumsPeople,
    people: store.people.people,
    fetchedPeople: store.people.fetched,
    fetchingPeople: store.people.fetching,
    photoDetails: store.photos.photoDetails,
    fetchingPhotoDetail: store.photos.fetchingPhotoDetail,
    fetchedPhotoDetail: store.photos.fetchedPhotoDetail,
  }
})(FavoritePhotos)
