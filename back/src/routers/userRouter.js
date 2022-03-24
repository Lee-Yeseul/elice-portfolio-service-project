import is from '@sindresorhus/is';
import { query, Router } from 'express';
import sharp from 'sharp'
import fs from 'fs'
import { login_required } from '../middlewares/login_required';
import {upload} from '../middlewares/uploadProfileImg';
import { userAuthService } from '../services/userService';

const userAuthRouter = Router();

userAuthRouter.post('/user/register', async function (req, res, next) {
  try {
    if (is.emptyObject(req.body)) {
      throw new Error(
        'headers의 Content-Type을 application/json으로 설정해주세요'
      );
    }

    // req (request) 에서 데이터 가져오기
    const { name, email, password } = req.body;

    // 위 데이터를 유저 db에 추가하기
    const newUser = await userAuthService.addUser({
      name,
      email,
      password,
    });

    if (newUser.errorMessage) {
      throw new Error(newUser.errorMessage);
    }

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

userAuthRouter.post('/user/login', async function (req, res, next) {
  try {
    // req (request) 에서 데이터 가져오기
    const { email, password } = req.body;

    // 위 데이터를 이용하여 유저 db에서 유저 찾기
    const user = await userAuthService.getUser({ email, password });

    if (user.errorMessage) {
      throw new Error(user.errorMessage);
    }

    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
});

userAuthRouter.get(
  '/userlist',
  login_required,
  async function (req, res, next) {
    try {
      // 전체 사용자 목록을 얻음
      const users = await userAuthService.getUsers();
      res.status(200).send(users);
    } catch (error) {
      next(error);
    }
  }
);

// user 검색 기능
userAuthRouter.get(
  '/userlist/search/:name',
  login_required,
  async function( req, res, next){
    try{
      const user_name = req.params.name;
      const searchedUsers = await userAuthService.getSearchedUsers({
        user_name,
      });
      res.status(200).send(searchedUsers);
    }catch(error){
      next(error);
    }
  }
)

userAuthRouter.get(
  '/user/current',
  login_required,
  async function (req, res, next) {
    try {
      // jwt토큰에서 추출된 사용자 id를 가지고 db에서 사용자 정보를 찾음.
      const user_id = req.currentUserId;
      const currentUserInfo = await userAuthService.getUserInfo({
        user_id,
      });

      if (currentUserInfo.errorMessage) {
        throw new Error(currentUserInfo.errorMessage);
      }

      res.status(200).send(currentUserInfo);
    } catch (error) {
      next(error);
    }
  }
);

userAuthRouter.put(
  '/users/:id',
  login_required,
  async function (req, res, next) {
    try {
      // URI로부터 사용자 id를 추출함.
      const user_id = req.params.id;
      // body data 로부터 업데이트할 사용자 정보를 추출함.
      const name = req.body.name ?? null;
      const email = req.body.email ?? null;
      const password = req.body.password ?? null;
      const description = req.body.description ?? null;

      const toUpdate = { name, email, password, description };

      // 해당 사용자 아이디로 사용자 정보를 db에서 찾아 업데이트함. 업데이트 요소가 없을 시 생략함
      const updatedUser = await userAuthService.setUser({ user_id, toUpdate });

      if (updatedUser.errorMessage) {
        throw new Error(updatedUser.errorMessage);
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);

userAuthRouter.get(
  '/users/:id',
  login_required,
  async function (req, res, next) {
    try {
      const user_id = req.params.id;
      const currentUserInfo = await userAuthService.getUserInfo({ user_id });

      if (currentUserInfo.errorMessage) {
        throw new Error(currentUserInfo.errorMessage);
      }

      res.status(200).send(currentUserInfo);
    } catch (error) {
      next(error);
    }
  }
);

// 클라이언트로부터 현재 비밀번호와 변경할 비밀번호를 입력 받아 userAuthService로 넘겨주고 반환 값으로 errormessage(해당 id 없을 때)/false(현재 비밀번호가 일치하지 않을 때)/true(일치하고 비밀번호가 잘 변경되었을 때)를 return 해준다.
userAuthRouter.put(
  '/users/password/:id',
  login_required,
  async function (req, res, next) {
    try {
      const user_id = req.params.id;

      const {pw} = req.body;
      const {newPw} = req.body;

      const toUpdate = {pw, newPw};

      const updatedPassword = await userAuthService.setPassword({user_id, toUpdate});
      // console.log(updatedPassword); // 현재 비밀번호가 맞을 때 true, 현재 비밀번호가 다를 때 false
      res.status(200).json(updatedPassword);
    } catch (error) {
      next(error);
    }
  }
)

// user 프로필 이미지 변경
userAuthRouter.put(
  '/users/profileImg/:id',
  upload.single("img"),
  async function (req, res, next){
    try{

      sharp(req.file.path)  // 압축할 이미지 경로
      .resize({ width: 600 }) // 비율을 유지하며 가로 크기 줄이기
      .withMetadata()	// 이미지의 exif데이터 유지
      .toBuffer((err, buffer) => {
        if (err) throw err;
        // 압축된 파일 새로 저장(덮어씌우기)
        fs.writeFile(req.file.path, buffer, (err) => {
          if (err) throw err;
        });
      });

      const user_id = req.params.id;
      const {filename} = req.file
      const profileImgPath = "http://localhost:5001/profileImg/" + filename
      const toUpdate = {
        file,
        profileImgPath
      };
      const uploadedImg = await userAuthService.setProfileImg({user_id, toUpdate});
      
      res.status(200).json(uploadedImg);
    }catch(error){
      next(error)
    }
  }
)

//user 프로필 사진 불러오기
userAuthRouter.get(
  '/users/profileImg/:id',
  async function(req, res, next){
    try{
      const user_id = req.params.id;
      const profileImgURL = await userAuthService.getProfileImgURL({user_id})
      res.send(profileImgURL)
    }catch(error){
      next(error)
    }
  }
)

userAuthRouter.delete(
  '/users/:id',
  //login_required,
  async function (req, res, next){
    try{
      const user_id = req.params.id;
      //유저 삭제하는 메소드 호출
      await userAuthService.deleteUser({ user_id });

      //유저 mvp 정보 삭제하는 메소드 호출
      await userAuthService.deleteUserAllInfo({ user_id });
      
      res.status(200).send();

    } catch (error){
      next(error);
    }
  }
);

// jwt 토큰 기능 확인용, 삭제해도 되는 라우터임.
userAuthRouter.get('/afterlogin', login_required, function (req, res, next) {
  res
    .status(200)
    .send(
      `안녕하세요 ${req.currentUserId}님, jwt 웹 토큰 기능 정상 작동 중입니다.`
    );
});



export { userAuthRouter };
