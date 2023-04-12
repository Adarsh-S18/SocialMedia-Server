import express from 'express'
import { addComment, allPosts, allReports, createPost, deleteComment, deletePost, getPost, getPostStat, getTimelinePost, likePost, rejectReport, reportPost, resolveReport, updatePost, userPosts } from '../Controllers/PostController.js'


const router = express.Router()

router.post('/', createPost);

router.get('/:id', getPost);

router.put('/:id', updatePost);

router.delete('/:id', deletePost);

router.put('/:id/like', likePost);

router.get('/timeline/all', getTimelinePost)

router.get('/profile/:id', userPosts)

router.get('/', allPosts)

router.get('/stats/:id', getPostStat)

router.get("/reports/:id", allReports);

router.put("/:id/report", reportPost);

router.get("/", allPosts)

router.delete("/:id/report", rejectReport);

router.delete("/:id/rejectReport", resolveReport);

router.put("/:id/comment", addComment)

router.delete("/:id/delete-comment" ,deleteComment)     

export default router