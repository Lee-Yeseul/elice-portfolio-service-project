import is from "@sindresorhus/is";
import {Router} from "express";
import {login_required} from "../middlewares/login_required";
import {projectService} from "../services/projectService";

const projectRouter = Router();
projectRouter.use(login_required);

  /*
   * project 생성
   * post 요청 - /project/create
   */
  projectRouter.post("/project/create", async function (req, res, next) {
    try {
      if (is.emptyObject(req.body)) {
        throw new Error(
          "headers의 Content-Type을 application/json으로 설정해주세요"
        );
      }
  
      // req (request) 에서 데이터 가져오기
      const {user_id} = req.body;
      const {title} = req.body;
      const {description} = req.body;
      const {from_date} = req.body;
      const {to_date} = req.body;
  
      // 위 데이터를 프로젝트 db에 추가하기
      const newProject = await projectService.addProject({
        user_id,
        title,
        description,
        from_date,
        to_date,
      });
      if (newProject.errorMessage) {
        throw new Error(newProject.errorMessage);
      }
  
      res.status(201).json(newProject);
    } catch (error) {
      next(error);
    }
  });

  /*
   * project id별 조회
   * post 요청 - /projects/:id
   */
  projectRouter.get("/projects/:id", async function (req, res, next) {
    try {
        // url로부터 project_Id 를 추출함.
        const projectId = req.params.id;
        const currentProject = await projectService.getProject({projectId});
  
        if (currentProject.errorMessage) {
          throw new Error(currentProject.errorMessage);
        }
  
        res.status(200).send(currentProject);
    } catch (error) {
      next(error);
    }
  });

  /*
   * project 수정
   * put 요청 - /projects/:id
   */
  projectRouter.put("/projects/:id", async function (req, res, next){
    try {
      // url로부터 project_Id 를 추출함.
      const projectId = req.params.id;

      // body data 로부터 업데이트할 project 정보를 추출함.
      const title = req.body.title ?? null;
      const description = req.body.description ?? null;
      const from_date = req.body.from_date ?? null;
      const to_date = req.body.to_date ?? null;

      const toUpdate = {title, description, from_date, to_date};

      // 해당 project 아이디로 사용자 정보를 db에서 찾아 업데이트함. 바뀐 부분 없으면 생략한다.
      const Project = await projectService.setProject({projectId, toUpdate});

      if (toUpdate.errorMessage) {
        throw new Error(Project.errorMessage);
      }
      res.status(200).json(Project);
    } catch (error) {
      next(error);
    }
  });

  /*
   * projectlist 조회
   * get 요청 - /projectlist/:user_id
   */
  projectRouter.get("/projectlist/:user_id", async function (req, res, next){
    try {
      const {user_id} = req.params;
      const projectList=await projectService.getProjectList({user_id});
      res.status(200).send(projectList);
    } catch (error) {
      next(error);
    }
  });

  projectRouter.delete("/projects/:id",async function (req, res, next) {
    try {
<<<<<<< HEAD
        // url로부터 user_id와 project_Id 를 추출함.
        const projectId = req.params.id;
        //projectId와 매칭되는 프로젝트 정보를 삭제함
        await projectService.deleteProject({projectId});

        res.status(200).json({
          result:"ok",
        });
=======
        // url로부터 project_Id 를 추출함.
        const projectId = req.params.id;
        await projectService.deleteProject({projectId});
        const projectList=await projectService.getProjectList({user_id});
  
        if (currentProject.errorMessage) {
          throw new Error(currentProject.errorMessage);
        }
  
        res.status(200).send(projectList);
>>>>>>> b6628e6 (수정된 back 폴더 추가)
    } catch (error) {
      next(error);
    }
  });

  export {projectRouter};