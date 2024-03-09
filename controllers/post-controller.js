import PostSchema from "../models/posts.js";

export const getAllPosts = async(req, res) => {
    try{
        const posts = await PostSchema.find().populate('user', '-passwordHash').exec()
        res.json(posts)
    } catch (e){
        console.log(e)
        res.status(500).json({
            message: 'Failed to get posts'
        })
    }
}

export const getPostById = async(req, res) => {
    try{
        const postId = req.params.id;
        const doc = await PostSchema.findOneAndUpdate(
            { _id: postId },
            { $inc: { viewsCount: 1 } },
            { returnDocument: 'after' }
        );
        if (!doc) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(doc);

    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to get the post'
        })
    }
}

export const removePost = async(req, res) => {
    try{
        const postId = req.params.id;
        const doc = await PostSchema.findOneAndDelete(
            {_id: postId},
        )

        if (!doc) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({
            success: true
        });

    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to delete post'
        })
    }
}

export const createPost = async (req, res) => {
    try {
        const doc = new PostSchema({
            title: req.body.title,
            text: req.body.text,
            tags: req.body.tags,
            imageURL: req.body.imageURL,
            user: req.userId
        })

        const post = await doc.save();

        res.json(post)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to create post.'
        })
    }
}

export const updatePost = async(req, res) => {
    try{
        const postId = req.params.id;
        const doc = await PostSchema.findOneAndUpdate(
            {_id: postId},
            {
                title: req.body.title,
                text: req.body.text,
                imageURL: req.body.imageURL,
                tags: req.body.tags,
                user: req.userId
            },
            { returnDocument: "after" }
        ).populate('user', '-passwordHash').exec()
        if(!doc) {
            return {
                message: 'Failed to update post.'
            }
        }
        res.json(doc)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Failed to update post.'
        })
    }
}