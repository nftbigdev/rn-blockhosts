import React, { createRef, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, Image, View, TouchableOpacity, TextInput, Linking } from 'react-native';
import { useMoralis } from "react-moralis";
import { ScrollView } from "react-native-gesture-handler";
import { useMoralisDapp } from "../providers/MoralisDappProvider/MoralisDappProvider";
import FullLoading from '../Components/Loadings/fullLoading';
import UtilService from '../utils/utilService'
import ModalCamera from '../Components/ModalCamera';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import CountryPicker from 'react-native-country-picker-modal';
import PhoneInput from 'react-native-phone-number-input';
import CheckBox from '@react-native-community/checkbox';

const EditProfileScreen = ({ navigation }) => {

  const { isAuthenticated, logout, setUserData, Moralis, user } = useMoralis();
  const { walletAddress, chainId } = useMoralisDapp();
  const [title, setTitle] = useState();
  const [email, setEmail] = useState();
  const [country, setCountry] = useState('United Kingdom');
  const [number, setNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('GB');
  const [fileAvatar, setFileAvatar] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalProfile, setIsModalProfile] = useState(false);
  const countryRef = useRef(null);
  const phoneInput = useRef(null);
  const [formattedValue, setFormattedValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isSelected, setSelection] = useState(false);

  // console.log('title', title)
  // console.log('email', email)
  // console.log('country', country)
  // console.log('fileAvatar', fileAvatar)
  // console.log('number', number)
  const isEnabledSave = title && email && country && number;

  useEffect(() => {
    if (user) {
      setTitle(user?.attributes?.name)
      setEmail(user?.attributes?.email)
      setFileAvatar(user?.attributes?.profileImage)
      setCountry(user?.attributes?.country || 'United Kingdom')
      setNumber(user?.attributes?.number)
      setPhoneCode(user?.attributes?.phoneCode || 'GB');
      setLoaded(true);
    }
  }, [user])

  const onSaveProfile = async () => {

    if(!isEnabledSave){
      return false
    }

    setIsLoading(true);
    let avatar = fileAvatar;
    if (fileAvatar?.includes('/data:image')) {
      avatar = await uploadImage(fileAvatar);
    }

    let request = {
      name: title || '',
      email: email || '',
      country: country || '',
      number: number || '',
      phoneCode: phoneCode || 'GB'
    }
    if (fileAvatar) {
      request.profileImage = avatar
    }

    await setUserData(request).then((res) => {
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
      console.log('error!', error)
    });
    setIsLoading(false);
    navigation.navigate('Home')
  }

  const logoutUser = () => {
    if (isAuthenticated) {
      logout();
      navigation.navigate('auth')
    }
  };

  const takePicture = async () => {
    console.log('there!')

    let res = await Permissions.askAsync(Permissions.CAMERA)
    if (res.status === 'granted') {
      let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      if (status === 'granted') {
        let image = await ImagePicker.launchCameraAsync({
          quality: 0.6,
          base64: true,
          aspect: [4, 4],
          quality: 1,
          allowsEditing: true
        })

        if (image.base64) {
          setFileAvatar(`data:image/jpg;base64,${image.base64}`);
        }
      }
    }
  }

  const pickImage = async () => {
    console.log('here!')
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (result.base64) {
      setFileAvatar(`data:image/jpg;base64,${result.base64}`);
    }
  };

  const uploadImage = async (myFile) => {
    const nowTime = new Date().getTime();
    var nftImageFile = new Moralis.File(nowTime, { base64: myFile });
    await nftImageFile.saveIPFS();
    return nftImageFile.ipfs();
  };

  const onSelect = (country) => {
    setCountry(country.name)
  }

  return (
    <ScrollView style={styles.root}>

      {isLoading &&
        <TouchableOpacity onPress={() => setIsLoading(false)}>
          <FullLoading />
        </TouchableOpacity>}

      <View style={styles.viewContainer}>
        <Text style={{ color: '#000', fontSize: 25, fontWeight: '700' }}>{'Edit Your Profile'}</Text>

        <TouchableOpacity onPress={() => setIsModalProfile(true)}>
          <Image source={fileAvatar ? { uri: fileAvatar } :
            require('../../assets/edit.png')}
            style={styles.logo}
          />
          {/* <Image source={
            require('../../assets/upload.png')}
            style={styles.upload}
          /> */}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', marginTop: 5 }}>
        </View>
      </View>

      <Text style={{ textAlign: 'center', marginTop: 12, color: '#3C404B' }}>{UtilService.truncate(walletAddress)}</Text>

      <View style={{ marginHorizontal: 30, marginVertical: 20 }}>

        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.button}>
            <TextInput style={{ color: '#000', fontSize: 16 }}
              placeholder={'Name'}
              placeholderTextColor={'#92959d'}
              value={title}
              onChangeText={(e) => setTitle(e)}
            />
          </View>

          <View style={styles.button}>
            <TextInput style={{ color: '#000', fontSize: 16 }}
              placeholder={'Email'}
              placeholderTextColor={'#92959d'}
              value={email}
              onChangeText={(e) => setEmail(e)}
            />
          </View>
          
          <View style={styles.button}>
            <CountryPicker
              ref={countryRef}
              withEmoji
              {...{
                onSelect,
              }}
              style={styles.button}
              placeholder={country}
            />
          </View>

          <View>

            {loaded ? <PhoneInput
              ref={phoneInput}
              defaultValue={number}
              value={number}
              defaultCode={phoneCode}
              layout="first"
              containerStyle={styles.button}
              textContainerStyle={{ paddingVertical: 0, backgroundColor: '#eff2f6' }}
              onChangeFormattedText={text => {
                setFormattedValue(text);
              }}
              onChangeText={(text) => {
                setNumber(text);
              }}
              onChangeCountry={(text) => setPhoneCode(text.cca2)}
            /> : <View></View>}
          </View>

          {/* <Text>number : {number}</Text>
              <Text>Formatted Value : {formattedValue}</Text>
              <Text>Formatted Value : {phoneCode}</Text> */}

          {/* <View style={styles.button}>
            <TextInput style={{ color: '#000', fontSize: 16 }}
              placeholder={'Number'}
              placeholderTextColor={'#92959d'}
              value={number}
              onChangeText={(e) => setNumber(e)}
            />
          </View> */}

          <View style={{  marginTop: 20, }}>
            <View style={{  maxWidth: 260, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Text style={styles.text}>By clicking ‘Save’ below you are agreeing to  </Text>
              <Text style={styles.text}>the</Text>
              <TouchableOpacity onPress={() => Linking.openURL("https://blockhosts.io/user-terms")}>
                <Text style={{ color: '#3adbbb', fontSize: 12 }}> terms and conditions </Text>
              </TouchableOpacity>
              <Text style={styles.text}>of use</Text>
            </View>

          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: !isEnabledSave ? 'rgba(175, 236, 214, 0.8)' : '#22DBBB' }]}
            onPress={() => onSaveProfile()}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>Save</Text>
          </TouchableOpacity>

          <View>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{marginTop: 30 }}>
              <Text style={{ color: '#3C404B', textDecorationLine: 'underline' }}>Go Back</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => logoutUser()} style={{marginTop: 15 }}>
              <Text style={{ color: '#3C404B', textDecorationLine: 'underline' }}>Log out</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>

      <View style={{ height: 20 }} />

      {isModalProfile && <ModalCamera
        onClickPicker={() => {
          setIsModalProfile(false);
          pickImage();
        }}
        onClickCamera={() => {
          setIsModalProfile(false);
          takePicture();
        }}
        onClose={() => setIsModalProfile(0)}
      />}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centeredView: {
    flex: 1,
  },
  modalView: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    marginTop: 40
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  t1: {
    fontSize: 40,
    lineHeight: 70,
    fontWeight: '700'
  },
  viewContainer: {
    alignItems: "center",
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginTop: 40
  },
  logo: {
    height: 180,
    width: 180,
    borderRadius: 90,
    marginTop: 12
  },
  right: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    minWidth: 290,
    backgroundColor: '#eff2f6',
    borderRadius: 12,
    marginTop: 20,
  },
  btnLog: {
    width: 120,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 30
  },
  text: {
    textAlign: 'center',
    color: '#92959d',
    fontSize: 12
  },
  upload: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 40,
    height: 30
  }
});

export default EditProfileScreen;