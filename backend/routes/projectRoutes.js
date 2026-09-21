import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { create, generate, get, list, loadOwnedProject, remove, update } from '../controllers/projectController.js';
import { githubRoute, vercelRoute } from './projectDeploy.js';

const projectRouter = express.Router();

projectRouter.get('/', requireAuth, list);
projectRouter.post('/', requireAuth, create);

projectRouter.get('/:id', requireAuth, get);
projectRouter.patch('/:id', requireAuth, update);

projectRouter.delete('/:id', requireAuth, remove);
projectRouter.post('/:id/generate', requireAuth, generate);

// to deploy the project(on vercel) and to create a repo on github
projectRouter.post('/:id/github', requireAuth, githubRoute(loadOwnedProject));
projectRouter.post('/:id/deploy', requireAuth, vercelRoute(loadOwnedProject));

export default projectRouter;