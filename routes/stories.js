const express = require("express")
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Story = require("../models/Story")

router.get('/add', ensureAuth, async (req, res) => {
    res.render('stories/add')
})

router.get('/edit/:id', ensureAuth, async (req, res) => {
    const story = await Story.findOne({
        _id: req.params.id
    }).lean()

    if(!story){
        return res.render('error/404')
    }

    if(story.user != req.user.id){
        res.redirect('/stories')
    }else{
        res.render('stories/edit', {
            story
        })
    }
})

router.get('/user/:userId', async (req, res) => {
    try {
      const stories = await Story.find({
        user: req.params.userId,
        status: 'public',
      })
        .populate('user')
        .lean()
  
      res.render('stories/index', {
        stories,
      })
    } catch (err) {
      console.error(err)
      res.render('error/500')
    }
  })
  

router.get('/:id', async (req, res) => {
    try {
      let story = await Story.findById(req.params.id).populate('user').lean()
  
      if (!story) {
        return res.render('error/404')
      }
  
      res.render('stories/show', {
        story,
      })
    } catch (err) {
      console.error(err)
      res.render('error/404')
    }
  })
  

router.put('/edit/:id', ensureAuth, async (req, res) => {
    let story = await Story.findOne({
        _id: req.params.id
    }).lean()

    if(!story){
        return res.render('error/404')
    }

    if(story.user != req.user.id){
        res.redirect('/stories')
    }else{
        story = await Story.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        res.redirect('/dashboard')
    }
})

router.delete('/delete/:id', ensureAuth, async (req, res) => {
    let story = await Story.findOne({
        _id: req.params.id
    }).lean()

    if(!story){
        return res.render('error/404')
    }

    if(story.user != req.user.id){
        res.redirect('/stories')
    }else{
        story = await Story.findByIdAndRemove(req.params.id)

        res.redirect('/dashboard')
    }
})

router.post('/', ensureAuth, async (req, res) => {
    try{
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    }catch(e){
        res.render("error/500")
    }
})

router.get('/', async (req, res) => {
    try{
        const stories = await Story.find({ status:'public' }).populate('user').sort({ createdAt:"desc" }).lean()
        res.render("stories/index", {
            stories
        })
    }catch(e){
        res.send(e)
        res.render('error/500')
    }
})



module.exports = router