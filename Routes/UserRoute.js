import express from 'express'
import { blockUser, deletePic, deleteUser, followUser, getAllUser, getFriends, getStat, getUser, unBlockUser, UnfollowUser, updateUser } from '../Controllers/UserController.js'


const router = express.Router()

router.get('/:id', getUser)

router.get('/friends/:userId', getFriends);

router.delete('/profilepic', deletePic)

router.get('/', getAllUser)

router.put('/:id', updateUser)

router.delete('/:id', deleteUser)

router.get('/stats/:id', getStat)

router.put('/:id/follow', followUser)

router.put('/:id/unfollow', UnfollowUser)

router.put('/block/:id', blockUser)

router.put('/unblock/:id', unBlockUser)


export default router