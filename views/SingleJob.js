import React, {useContext, useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import {Button, Card, Divider, Input, Text} from 'react-native-elements';
import {uploadsUrl} from '../utils/variables';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser, useComments, useMedia} from '../hooks/ApiHooks';
import {parse} from '../utils/helpers';
import CommentList from '../components/CommentList';
import {MainContext} from '../contexts/MainContext';
import {TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ListButtonElement from '../components/ListButtonElement';

const SingleJob = ({route, navigation}) => {
  const {file} = route.params;
  const {getUser} = useUser();
  const {deleteFile} = useMedia();
  const {
    updateComments,
    setUpdateComments,
    user,
    userToken,
    update,
    setUpdate,
  } = useContext(MainContext);
  const {getCommentsByFile, postComment} = useComments();
  const [owner, setOwner] = useState({});
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  // console.log(owner);
  const fetchOwner = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      let userData = await getUser(file.user_id, userToken);
      userData = parse(userData, 'full_name');
      // console.log('userData', userData);
      setOwner(userData);
    } catch (error) {
      console.error('fetchOwner error in SingleJob', error.message);
    }
  };

  const fetchComments = async () => {
    try {
      const commentResponse = await getCommentsByFile(file.file_id);
      setComments(commentResponse);
    } catch (e) {
      console.error(e.message);
    }
  };

  const doSendComment = async () => {
    const tempComment = comment.trim();
    if (tempComment.length === 0) return;
    try {
      const response = await postComment(file.file_id, tempComment);
      console.log('doSendComment', response);
      setUpdateComments(!updateComments);
      setComment('');
    } catch (e) {
      console.error('doSendComment', e.message);
    }
  };

  const askDelete = () => {
    Alert.alert('Are you sure?', 'Do you want to this job offer?', [
      {text: 'Cancel'},
      {text: 'Delete', onPress: doDelete},
    ]);
  };

  const doDelete = async () => {
    try {
      await deleteFile(file.file_id, userToken);
      setUpdate(!update);
      navigation.pop();
    } catch (e) {
      Alert.alert('Error while deleting comment', e.message);
    }
  };

  useEffect(() => {
    // console.log('SingleFile', file);
    fetchOwner();
  }, []);

  useEffect(() => {
    fetchComments();
  }, [updateComments]);

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Card.Title h3> {file.title}</Card.Title>
          <Card.Divider />
          <View style={styles.jobInfo}>
            <Card.Image
              source={{uri: uploadsUrl + file.filename}}
              style={styles.img}
              resizeMode="contain"
            />
            <View>
              <Text h3>Job poster</Text>
              <Text h4>{owner.full_name}</Text>
            </View>
          </View>
          <Text style={styles.userInfo}>{file.description} </Text>
          <Text style={styles.userInfo}>Pay here</Text>
          <Button title={'Contact employer'}></Button>
        </Card>

        <Card>
          <Card.Title>Comments</Card.Title>
          <Card.Divider />
          <CommentList comments={comments} />
        </Card>

        <Divider style={{height: 20, backgroundColor: '#FFF0'}} />

        {user.user_id === file.user_id && (
          <View style={styles.box}>
            <ListButtonElement text="Delete Job Offer" onPress={askDelete} />
          </View>
        )}
      </ScrollView>
      {user !== null && (
        <Input
          placeholder="Enter comment here"
          renderErrorMessage={false}
          value={comment}
          onChangeText={(text) => setComment(text)}
          rightIcon={() => (
            <TouchableOpacity onPress={doSendComment}>
              <Ionicons name="send-outline" size={30} />
            </TouchableOpacity>
          )}
        />
      )}
    </>
  );
};
const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    alignItems: 'stretch',
  },
  jobInfo: {
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'center',
  },
  userDetails: {
    flexGrow: 1,
  },
  img: {
    height: 100,
    width: 100,
    aspectRatio: 1,
    borderRadius: 40,
    marginEnd: 10,
  },
  desc: {
    fontWeight: 'bold',
  },
  userInfo: {
    fontSize: 20,
    marginBottom: 10,
  },
  contact: {
    height: 30,
  },
  box: {
    width: '100%',
    backgroundColor: '#75B09C',
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
});

SingleJob.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};

export default SingleJob;
