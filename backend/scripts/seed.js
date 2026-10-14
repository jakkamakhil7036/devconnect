const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Discussion = require('../models/Discussion');
const Contribution = require('../models/Contribution');
const Notification = require('../models/Notification');
const ShowcaseProject = require('../models/ShowcaseProject');
const ResumeData = require('../models/ResumeData');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/devconnect');
    console.log('Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Discussion.deleteMany();
    await Contribution.deleteMany();
    await Notification.deleteMany();
    await ShowcaseProject.deleteMany();
    await ResumeData.deleteMany();
    console.log('Database cleared.');

    // 1. Create Admin
    const admin = await User.create({
      name: 'Dr. Jane Smith',
      email: 'admin@devconnect.edu',
      password: 'adminpassword', // Will be hashed by pre-save hook
      role: 'admin',
      collegeName: 'DevConnect Technical Institute',
      branch: 'Computer Science',
      year: 'Faculty'
    });

    // 2. Create Students
    const student1 = await User.create({
      name: 'Alice Cooper',
      email: 'alice@devconnect.edu',
      password: 'password123',
      collegeName: 'DevConnect Technical Institute',
      branch: 'Computer Science',
      year: '3rd Year',
      skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'JavaScript'],
      interests: ['Web Apps', 'AI/ML', 'Cloud Computing'],
      bio: 'Full-stack developer student with a passion for web technologies and UI design.',
      linkedinUrl: 'https://linkedin.com/in/alice-cooper-demo',
      githubUrl: 'https://github.com/alice-cooper-demo',
      phone: '123-456-7890',
      contributionScore: 112 // Start with some contribution points
    });

    const student2 = await User.create({
      name: 'Bob Marley',
      email: 'bob@devconnect.edu',
      password: 'password123',
      collegeName: 'DevConnect Technical Institute',
      branch: 'Information Technology',
      year: '3rd Year',
      skills: ['Python', 'OpenCV', 'AI/ML', 'TensorFlow', 'Java'],
      interests: ['AI', 'Computer Vision', 'Deep Learning'],
      bio: 'Enthusiastic machine learning researcher, interested in neural network optimizations.',
      linkedinUrl: 'https://linkedin.com/in/bob-marley-demo',
      githubUrl: 'https://github.com/bob-marley-demo',
      phone: '123-456-7891',
      contributionScore: 68
    });

    const student3 = await User.create({
      name: 'Charlie Brown',
      email: 'charlie@devconnect.edu',
      password: 'password123',
      collegeName: 'DevConnect Technical Institute',
      branch: 'Software Engineering',
      year: '2nd Year',
      skills: ['Java', 'SQL', 'HTML/CSS', 'Python', 'C++'],
      interests: ['Databases', 'Algorithms', 'Game Development'],
      bio: 'Passionate coder and database engineering student.',
      linkedinUrl: 'https://linkedin.com/in/charlie-brown-demo',
      githubUrl: 'https://github.com/charlie-brown-demo',
      phone: '123-456-7892',
      contributionScore: 23
    });

    console.log('Users created.');

    // 3. Create Projects
    // Project 1: In Progress
    const project1 = await Project.create({
      title: 'DevConnect Collaboration Platform',
      description: 'An AI-powered student team-building and progress monitoring web app supporting file repositories, forums, and automatic resume builders.',
      technologies: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
      requiredTeamSize: 4,
      category: 'Web Development',
      difficulty: 'Advanced',
      status: 'In Progress',
      creator: student1._id,
      members: [
        { user: student1._id, role: 'Team Leader' },
        { user: student2._id, role: 'AI Engineer' },
        { user: student3._id, role: 'Database Engineer' }
      ],
      progress: 60
    });

    // Project 2: Completed
    const project2 = await Project.create({
      title: 'Library Management System',
      description: 'A classic desktop application to handle cataloging, user registry, book issues, and fine tracking with a relational database backend.',
      technologies: ['Java', 'MySQL', 'JDBC'],
      requiredTeamSize: 2,
      category: 'Software Systems',
      difficulty: 'Beginner',
      status: 'Completed',
      creator: student3._id,
      members: [
        { user: student3._id, role: 'Team Leader' },
        { user: student1._id, role: 'Frontend Developer' }
      ],
      progress: 100
    });

    // Project 3: Open
    const project3 = await Project.create({
      title: 'Smart Attendance System',
      description: 'Automate classroom attendance registration using face detection and recognition cameras logging student attendance history.',
      technologies: ['Python', 'OpenCV', 'Flask', 'SQLite'],
      requiredTeamSize: 3,
      category: 'AI / Computer Vision',
      difficulty: 'Advanced',
      status: 'Open',
      creator: student2._id,
      members: [
        { user: student2._id, role: 'Team Leader' }
      ],
      progress: 0
    });

    console.log('Projects created.');

    // 4. Create Tasks
    // For project 1 (DevConnect)
    const task1 = await Task.create({
      title: 'Database Schema Design',
      description: 'Define Mongoose schemas for Users, Projects, Repos, Discussions, and scoring tables.',
      status: 'Completed',
      project: project1._id,
      assignedTo: student3._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const task2 = await Task.create({
      title: 'Setup Express Authentication APIs',
      description: 'Build signup/login route controllers using bcrypt password hashing and JWT issuance.',
      status: 'Completed',
      project: project1._id,
      assignedTo: student1._id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    });

    const task3 = await Task.create({
      title: 'Implement AI Matcher Logic',
      description: 'Integrate the recommendation engine to parse student interests and match against project templates.',
      status: 'In Progress',
      project: project1._id,
      assignedTo: student2._id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });

    const task4 = await Task.create({
      title: 'Design Glassmorphism Dashboard UI',
      description: 'Build the react student analytics dashboards using Tailwind CSS backdrop-blur and responsive panels.',
      status: 'To Do',
      project: project1._id,
      assignedTo: student1._id,
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
    });

    // For project 2 (Library System) - Completed Tasks
    await Task.create({
      title: 'JDBC DB Driver Setup',
      description: 'Configure library table initialization and JDBC credentials connectivity.',
      status: 'Completed',
      project: project2._id,
      assignedTo: student3._id
    });

    await Task.create({
      title: 'Build Swing GUI Panels',
      description: 'Construct cataloging cards and search boxes.',
      status: 'Completed',
      project: project2._id,
      assignedTo: student1._id
    });

    console.log('Tasks created.');

    // 5. Create Discussions
    const discussion1 = await Discussion.create({
      project: project1._id,
      user: student1._id,
      title: 'Choosing styling solution: CSS modules vs Tailwind CSS',
      content: 'We need to finalise our styling setup. I feel Tailwind CSS offers faster prototyping for our modern student UI, while keeping the responsive grid clean. Thoughts?',
      comments: [
        {
          user: student2._id,
          content: 'Strongly agree! Tailwind fits perfectly with the glassmorphic designs and colors we want to apply to our dashboards.',
          replies: [
            {
              user: student1._id,
              content: 'Sweet, let\'s go with Tailwind then. I\'ll configure the theme options in tailwind.config.js.'
            }
          ]
        },
        {
          user: student3._id,
          content: 'Tailwind CSS works fine with React. Just make sure the node modules are cached so the build completes quickly.'
        }
      ]
    });

    console.log('Discussions created.');

    // 6. Showcase completed Library system
    await ShowcaseProject.create({
      project: project2._id,
      title: 'Library System with Java Swing',
      description: 'An elegant desktop CRUD portal supporting transaction history logs, fine counters, and automated book reservations in a secure relational catalog.',
      teamMembers: [student3._id, student1._id],
      technologies: ['Java', 'MySQL', 'JDBC', 'Swing'],
      videoLink: 'https://youtube.com/demo-watch-library',
      githubLink: 'https://github.com/charlie-brown/library-swing-app',
      screenshots: ['https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800'],
      likes: [student2._id],
      comments: [
        {
          user: student2._id,
          content: 'This desktop UI is super responsive. Excellent work bob/charlie!'
        }
      ],
      isTrending: true
    });

    console.log('Showcase projects seeded.');

    // 7. Seed sample Contributions
    await Contribution.create([
      {
        user: student1._id,
        project: project1._id,
        points: 10,
        actionType: 'Code Upload',
        description: 'Uploaded auth middleware file setup'
      },
      {
        user: student1._id,
        project: project1._id,
        points: 2,
        actionType: 'Forum Post',
        description: 'Posted "Choosing styling solution: CSS modules vs Tailwind CSS"'
      },
      {
        user: student2._id,
        project: project1._id,
        points: 1,
        actionType: 'Forum Reply',
        description: 'Replied to styling discussion post'
      },
      {
        user: student3._id,
        project: project1._id,
        points: 5,
        actionType: 'Task Completed',
        description: 'Completed task: Database Schema Design'
      },
      {
        user: student1._id,
        project: project2._id,
        points: 50,
        actionType: 'Project Completion',
        description: 'Completed the project: Library Management System'
      },
      {
        user: student3._id,
        project: project2._id,
        points: 50,
        actionType: 'Project Completion',
        description: 'Completed the project: Library Management System'
      }
    ]);

    // 8. Seed Notifications
    await Notification.create([
      {
        user: student1._id,
        content: 'Bob Marley joined your project "DevConnect Collaboration Platform" as AI Engineer.',
        type: 'join',
        project: project1._id,
        read: false
      },
      {
        user: student1._id,
        content: 'Charlie Brown completed the task "Database Schema Design" in project "DevConnect".',
        type: 'task',
        project: project1._id,
        read: true
      }
    ]);

    // 9. Seed Resume Data overrides
    await ResumeData.create([
      {
        user: student1._id,
        objective: 'Passionate and detail-oriented computer science student aiming to contribute full-stack development expertise towards building user-centric web platforms.',
        education: [
          {
            school: 'DevConnect Technical Institute',
            degree: 'Bachelor of Technology',
            fieldOfStudy: 'Computer Science & Engineering',
            startYear: '2023',
            endYear: '2027',
            grade: 'CGPA 9.2'
          }
        ],
        certifications: ['AWS Certified Developer Associate', 'MongoDB Associate Developer'],
        skills: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'JavaScript', 'Git']
      }
    ]);

    console.log('Resume templates seeded.');

    console.log('Database successfully seeded!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
