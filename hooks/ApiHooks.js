import axios from 'axios';
import {useContext, useEffect, useState} from 'react';
import {MainContext} from '../contexts/MainContext';
import {appID, baseUrl, uploadsUrl} from '../utils/variables';
import {parse} from '../utils/helpers';
import {MAPBOX_TOKEN} from '@env';

// general function for fetching (options default value is empty object)
const doFetch = async (url, options = {}) => {
  const response = await fetch(url, options);
  const json = await response.json();
  if (json.error) {
    // if API response contains error message (use Postman to get further details)
    throw new Error(json.message + ': ' + json.error);
  } else if (!response.ok) {
    // if API response does not contain error message, but there is some other error
    throw new Error('doFetch failed');
  } else {
    // if all goes well
    return json;
  }
};

const useLoadMedia = () => {
  const [mediaArray, setMediaArray] = useState([]);
  const {update} = useContext(MainContext);
  const {userToken} = useContext(MainContext);
  const {getUser} = useUser();

  const loadMedia = async () => {
    try {
      const listJson = await doFetch(baseUrl + 'tags/' + appID);

      console.log('listJson', listJson);
      const media = await Promise.all(
        listJson.map(async (item) => {
          let fileJson = await doFetch(baseUrl + 'media/' + item.file_id);
          fileJson = parse(fileJson, 'description');

          let userinfo = await getUser(item.user_id, userToken);
          userinfo = parse(userinfo, 'full_name');
          fileJson.userinfo = userinfo;
          return fileJson;
        })
      );
      console.log('media array data', media);
      setMediaArray(media);
    } catch (error) {
      console.error('loadmedia error', error.message);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [update]);
  return mediaArray;
};

const useLogin = () => {
  const postLogin = async (userCredentials) => {
    const {getFilesByTag} = useTag();

    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(userCredentials),
    };
    try {
      const userData = await doFetch(baseUrl + 'login/', options);
      // console.log('userData', userData);
      const imgs = await getFilesByTag(
        `${appID}_avatar_${userData.user.user_id}`
      );
      // console.log('imgs', imgs);
      if (imgs.length > 0) {
        userData.user.avatar = `${uploadsUrl}${imgs.pop().filename}`;
        // console.log('userData', userData);
      }
      return userData;
    } catch (error) {
      throw new Error(error.message);
    }
  };
  return {postLogin};
};

const useUser = () => {
  const postRegister = async (inputs) => {
    console.log('trying to create user', inputs);
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    };
    try {
      const json = await doFetch(baseUrl + 'users', fetchOptions);
      console.log('register resp', json);
      return json;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const checkToken = async (token) => {
    const {getFilesByTag} = useTag();

    const options = {
      method: 'GET',
      headers: {'x-access-token': token},
    };
    try {
      let userData = await doFetch(baseUrl + 'users/user', options);
      userData = parse(userData, 'full_name');
      const imgs = await getFilesByTag(`${appID}_avatar_${userData.user_id}`);
      if (imgs.length > 0) {
        userData.avatar = `${uploadsUrl}${imgs.pop().filename}`;
      }
      return userData;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const getUser = async (id, token) => {
    const {getFilesByTag} = useTag();

    const options = {
      method: 'GET',
      headers: {'x-access-token': token},
    };
    try {
      const userData = await doFetch(baseUrl + 'users/' + id, options);
      const imgs = await getFilesByTag(`${appID}_avatar_${userData.user_id}`);
      if (imgs.length > 0) {
        userData.avatar = `${uploadsUrl}${imgs.pop().filename}`;
      }
      return userData;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const checkIsUserAvailable = async (username) => {
    try {
      const result = await doFetch(baseUrl + 'users/username/' + username);
      return result.available;
    } catch (error) {
      throw new Error('apihooks checkIsUserAvailable', error.message);
    }
  };

  const updateUser = async (data, token) => {
    const options = {
      method: 'put',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    try {
      const result = await doFetch(baseUrl + 'users', options);
      return result;
    } catch (e) {
      throw new Error('apiHooks updateUser: ' + e);
    }
  };

  return {postRegister, checkToken, checkIsUserAvailable, getUser, updateUser};
};

const useTag = () => {
  const postTag = async (tag, token) => {
    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'x-access-token': token},
      body: JSON.stringify(tag),
    };
    try {
      const result = await doFetch(baseUrl + 'tags', options);
      return result;
    } catch (error) {
      throw new Error('postTag error:', error.message);
    }
  };

  const getFilesByTag = async (tag) => {
    try {
      const result = await doFetch(baseUrl + 'tags/' + encodeURI(tag));
      return result;
    } catch (error) {
      throw new Error('postTag error:', error.message);
    }
  };

  return {postTag, getFilesByTag};
};

const useMedia = () => {
  const upload = async (fd, token) => {
    const options = {
      method: 'POST',
      headers: {'x-access-token': token},
      data: fd,
      url: baseUrl + 'media',
    };
    console.log('apihooks upload', options);
    try {
      const response = await axios(options);
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const getFile = async (id) => {
    try {
      const resp = await doFetch(baseUrl + 'media/' + id);
      return resp;
    } catch (e) {
      throw new Error('getFile error: ' + e.message);
    }
  };

  const updateFile = async (fileId, fileInfo, token) => {
    const options = {
      method: 'PUT',
      headers: {'x-access-token': token, 'Content-type': 'application/json'},
      body: JSON.stringify(fileInfo),
    };
    console.log('options', options);
    try {
      const result = await doFetch(baseUrl + 'media/' + fileId, options);
      return result;
    } catch (error) {
      console.error('updatefile error', error.message);
    }
  };

  return {upload, getFile, updateFile};
};

const useLocation = () => {
  const [locationArray, setLocationArray] = useState([]);

  const searchLocation = async (search) => {
    const options = {
      method: 'GET',
    };
    try {
      const searchResp = await axios(
        'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
          search +
          '.json?types=place&access_token=' +
          MAPBOX_TOKEN,
        options
      );

      setLocationArray(searchResp.data.features);
    } catch (error) {
      console.error('Search failed', error);
      throw new Error(error.message);
    }
    return locationArray;
  };

  return {searchLocation};
};

const useFavourite = () => {
  const {userToken} = useContext(MainContext);
  const postFavourite = async (id) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': userToken,
      },
      body: JSON.stringify(id),
    };
    try {
      const postResult = await doFetch(baseUrl + 'favourites', options);
      return postResult;
    } catch (error) {
      console.error('post Favourite error', error.message);
    }
  };

  const deleteFavourite = async (id) => {
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': userToken,
      },
    };
    try {
      const deleteResult = await doFetch(
        baseUrl + 'favourites/file/' + id,
        options
      );
      return deleteResult;
    } catch (error) {
      console.error('delete Favourite error', error.message);
    }
  };

  return {postFavourite, deleteFavourite};
};

const useLoadFavourites = () => {
  const [favouriteArray, setFavouriteArray] = useState([]);
  const {update} = useContext(MainContext);
  const {userToken} = useContext(MainContext);
  const {getUser} = useUser();

  const getFavourites = async () => {
    try {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': userToken,
        },
      };
      const listJson = await doFetch(baseUrl + 'favourites', options);

      const favourites = await Promise.all(
        listJson.map(async (item) => {
          let fileJson = await doFetch(baseUrl + 'media/' + item.file_id);
          fileJson = parse(fileJson, 'description');

          let userinfo = await getUser(item.user_id, userToken);
          userinfo = parse(userinfo, 'full_name');
          console.log('userinfo', userinfo);
          fileJson.userinfo = userinfo;
          console.log('fileJson', fileJson);
          return fileJson;
        })
      );

      console.log('favourite files', favourites);
      setFavouriteArray(favourites);
    } catch (error) {
      console.error('getFavourites error', error.message);
    }
  };

  useEffect(() => {
    getFavourites();
  }, [update]);
  return favouriteArray;
};

const useComments = () => {
  const {getUser} = useUser();
  const {userToken} = useContext(MainContext);

  const getCommentsByFile = async (id) => {
    try {
      const response = await doFetch(`${baseUrl}comments/file/${id}`);
      const commentInfo = await Promise.all(
        response.map(async (item) => {
          let userJson = await getUser(item.user_id, userToken);
          userJson = parse(userJson, 'full_name');
          item.user = userJson;
          return item;
        })
      );
      return commentInfo;
    } catch (e) {
      throw new Error('getCommentsByFile: ' + e.message);
    }
  };

  const deleteComment = async (id) => {
    const options = {
      method: 'DELETE',
      headers: {'x-access-token': userToken},
    };
    try {
      const response = await doFetch(`${baseUrl}comments/${id}`, options);
      return response;
    } catch (e) {
      throw new Error('getCommentsBdeleteCommentyFile: ' + e.message);
    }
  };

  const postComment = async (id, comment) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': userToken,
      },
      body: JSON.stringify({file_id: id, comment}),
    };
    try {
      const response = await doFetch(`${baseUrl}comments`, options);
      return response;
    } catch (e) {
      throw new Error('postComment: ' + e.message);
    }
  };

  return {getCommentsByFile, deleteComment, postComment};
};

export {
  useLogin,
  useUser,
  useLoadMedia,
  useMedia,
  useTag,
  useLocation,
  useFavourite,
  useLoadFavourites,
  useComments,
};
