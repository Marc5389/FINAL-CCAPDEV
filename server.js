const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const multer = require('multer');
const User = require('./public/js/users');
const Post = require('./public/js/post');
const Comment = require('./public/js/commentPost')
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use sessions for tracking logins
app.use(session({
    secret: 'your secret key',
    resave: true,
    saveUninitialized: false
}));

// Connect to MongoDB
mongoose.connect("mongodb+srv://marc:OrHC9a0PXfR0ehKs@atlascluster.7jonk21.mongodb.net/?retryWrites=true&w=majority")
.then(() => console.log('Successfully Connected to Database.'));

// Serve static files from the 'public' directory
app.use(express.static("public"));
app.use(express.static(__dirname));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images'); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // File naming convention
    }
});

// Create the Multer instance
const upload = multer({ storage: storage });

// Define routes
app.get('/', (req, res) => {
    res.render('Login-Register');
});

app.get('/login', (req, res) => {
    res.render('Login-Register'); 
});

app.post('/login', async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).maxTimeMS(10000).exec();

        if (user) {
            const isPasswordCorrect = await user.comparePassword(password);

            if (isPasswordCorrect) {
                req.session.email = email;
                req.session.user = user;
                res.json({ status: "success", message: "Login successful!" });
                console.log("Login Success!");
            } else {
                res.json({ status: "fail", message: "Incorrect password." });
                console.log("Login Failed: Incorrect password.");
            }
        } else {
            res.json({ status: "fail", message: "Email not found." });
            console.log("Login Failed: Email not found.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

app.post('/signup', async(req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.json({ status: "fail", message: "Email is already in use." });
        } else {
            const newUser = new User({ username, email, password });
            newUser.username = username;
            await newUser.save();

            res.json({ status: "success", message: "Signup successful!" });
            console.log("Signup Success!");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

app.get('/main', async (req, res) => {
    try {
        let sortTypeDate = req.query.sortDate || 'desc'; // Default sort order for date
        let sortTypeRating = req.query.sortRating || 'desc'; // Default sort order for ratingValue

        let sortCriteria = {};

        // Sorting criteria for date
        if (sortTypeDate === 'asc') {
            sortCriteria.datePosted = 1; // Sorting by date in ascending order
        } else {
            sortCriteria.datePosted = -1; // Sorting by date in descending order
        }

        // Sorting criteria for rating
        let ratingSortCriteria = {};
        if (sortTypeRating === 'asc') {
            ratingSortCriteria.ratingValue = 1; // Sorting by rating in ascending order
        } else {
            ratingSortCriteria.ratingValue = -1; // Sorting by rating in descending order
        }

        // Fetch all posts from the 'post' collection and apply both date and rating sorting criteria
        let posts = await Post.find({}).sort(sortCriteria).sort(ratingSortCriteria);

        // Check if there is a message query parameter in the URL
        const message = req.query.message || '';

        // Render the 'main.ejs' view and pass the posts, message, and sort parameters data
        res.render('main', { posts, message, sortTypeDate, sortTypeRating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch posts' });
    }
});

app.get('/createpage', (req, res) => {
    const user = req.session.user; // Retrieve the user object from the session

    if (user) {
        // If the user is logged in and you have their information in the session, pass it to the template
        res.render('createpost', { user });
    } else {
        // Redirect to the login page or handle the case where the user is not authenticated
        res.redirect('/login');
    }
});

app.post('/createpost', async (req, res) => {
    try {
        // Extract relevant data from the request body
        const { caption, description, datePosted, ratingValue, imageFile, username, comment, cUsername } = req.body;

        // Assuming you have the user information available in the request (after authentication)
        const user = req.session.user; // This represents the user object after authentication

        if (!user || !user.username) {
            console.error('User data not available or username not found');
            return res.status(400).json({ status: 'error', message: 'User data not available' });
        }

        // Create a new Post instance using the 'Post' model
        const newPost = new Post({
            username: user.username, // Associate the post with the current user's username
            caption,
            description,
            datePosted: req.body.datePosted,
            ratingValue: req.body.ratingValue,
            imageFile,
            comment,
            cUsername: user.username
        });

        // Save the new post to the 'post' collection in the database
        await newPost.save();

        // Redirect to the main feed after successful post creation
        console.log('Post created successfully');
        res.redirect('/main');
    } catch (error) {
        console.error('Failed to create post:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create post', error: error.message });
    }
});

app.post('/like/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ status: 'error', message: 'Post not found' });
        }

        // Check if the user already liked the post
        const userId = req.session.user._id; // Assuming user information is stored in the session
        const likedIndex = post.likes.indexOf(userId);

        if (likedIndex !== -1) {
            // User already liked, remove the like
            post.likes.splice(likedIndex, 1);
        } else {
            // User didn't like, add the like
            post.likes.push(userId);
        }

        post.likeCount = post.likes.length;

        // Save the updated post
        await post.save();

        res.redirect('/main');
    } catch (error) {
    console.error('Failed to create comment:', error);
    res.status(500).json({ status: 'error', message: 'Failed to toggle like', error: error.message });
    }
});

app.get('/userprofile', async (req, res) => {
    try {
        const user = req.session.user; // Retrieve the logged-in user's information from the session

        if (!user || !user.username) {
            // If the user is not logged in or username is not available, redirect to login
            res.redirect('/login');
            return;
        }

        // Fetch posts by the logged-in user from the 'Post' collection
        const userPosts = await Post.find({ username: user.username }).exec();

        // Render the 'userprofile.ejs' view and pass the userPosts data
        res.render('userprofile', { user, userPosts });
    } catch (error) {
        console.error('Error fetching user profile data:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch user profile data' });
    }
});


app.get('/about', (req, res) => {
    res.render('about'); // Assuming you have an 'about.ejs' view
});

// Add a route to render the edit-profile page
app.get('/edit-profile', async (req, res) => {
    try {
        const user = req.session.user; // Retrieve the logged-in user's information from the session

        if (!user || !user.username) {
            // If the user is not logged in or username is not available, redirect to login
            res.redirect('/login');
            return;
        }

        // Render the 'edit-profile.ejs' view and pass the user data
        res.render('edit-profile', { user });
    } catch (error) {
        console.error('Error rendering edit profile page:', error);
        res.status(500).json({ status: 'error', message: 'Failed to render edit profile page' });
    }
});

// Handle the edit-profile form submission
app.post('/edit-profile', upload.single('profilePicture'), async (req, res) => {
    try {
        const user = req.session.user;

        if (!user || !user._id) {
            return res.status(400).json({ status: 'error', message: 'User data not available' });
        }

        // Check current password if a new password is provided
        if (req.body.currentPassword && req.body.newPassword) {
            const userFromDb = await User.findById(user._id);
            const isMatch = await bcrypt.compare(req.body.currentPassword, userFromDb.password);

            if (isMatch) {
                const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
                await User.findByIdAndUpdate(user._id, { password: hashedPassword });
            } else {
                return res.status(400).json({ status: 'error', message: 'Current password is incorrect' });
            }
        }

        // Update profile picture if provided
        if (req.file) {
            const profilePicturePath = req.file.path;
            await User.findByIdAndUpdate(user._id, { profilePicture: profilePicturePath });
        }

        // Update other profile information
        const { username, email, bio } = req.body;
        await User.findByIdAndUpdate(user._id, { username, email, bio });

        // Fetch the updated user data
        const updatedUser = await User.findById(user._id);

        // Update session data
        req.session.user = updatedUser;

        console.log('Profile update successful');
        res.redirect('/userprofile');
    } catch (error) {
        console.error('Profile update failed:', error);
        res.status(500).json({ status: 'error', message: 'Profile update failed', error: error.message });
    }
});

app.post('/commentpost', async (req, res) => {
    try {
        const { postId, comment } = req.body;
        const user = req.session.user;

        if (!user || !user.username) {
            return res.status(400).json({ status: 'error', message: 'User data not available' });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ status: 'error', message: 'Post not found' });
        }

        // Assuming your post schema has 'comments' as an array of embedded documents
        post.comments.push({
            cUsername: user.username,
            comment: comment
        });

        await post.save();

        console.log('Comment created successfully');
        res.redirect('/main');
    } catch (error) {
        console.error('Failed to create comment:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create comment', error: error.message });
    }
});

app.delete('/delete-post/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;

        // Use Mongoose to find and delete the post by ID
        const deletedPost = await Post.findByIdAndDelete(postId);

        if (!deletedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port 3000'));

app.get('/signout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
    console.log("Logged out.");
});