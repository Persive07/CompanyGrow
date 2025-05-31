// backend/seedCourses.js
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/course.model'); // adjust path as needed

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const seedCourses = async () => {
  await Course.deleteMany(); // Clear existing courses

  const courses = [
    {
      name: "Full Stack Web Development",
      description: "Master the art of building modern, scalable full stack applications. This course guides you through frontend development using HTML, CSS, JavaScript, and React, followed by backend integration using Node.js, Express, and MongoDB. Gain hands-on experience building real-world applications and deploy them to the cloud.",
      category: "Programming",
      difficulty: "Intermediate",
      preRequisites: ["HTML", "CSS", "JavaScript"],
      skillsGained: ["Frontend Development", "Backend Development", "API Integration", "MongoDB", "React", "Authentication"],
      eta: "6 weeks",
      createdAt: new Date(),
      badgeReward: 'Cyan',
      content: [
        {
          title: "Week 1: HTML, CSS & Responsive Layouts",
          description: "Kick off with the basics of HTML5 and CSS3. Understand semantic tags, lists, forms, and CSS selectors. Dive into layout systems like Flexbox and Grid. Learn to create responsive web pages that adapt across devices. Finish with a mini-project landing page.",
          videoUrl: [
            "https://www.youtube.com/watch?v=UB1O30fR-EE",
            "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
            "https://www.youtube.com/watch?v=HgtgKZJ5V7o"
          ],
          resourceLink: [
            "https://developer.mozilla.org/en-US/docs/Web/HTML",
            "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
            "https://web.dev/learn/css/"
          ]
        },
        {
          title: "Week 2: JavaScript Fundamentals",
          description: "Learn core JavaScript concepts like variables, data types, functions, arrays, objects, loops, and conditionals. Explore the DOM and event handling to make your pages interactive. Practice building a basic interactive to-do app with vanilla JS.",
          videoUrl: [
            "https://www.youtube.com/watch?v=W6NZfCO5SIk",
            "https://www.youtube.com/watch?v=hdI2bqOjy3c",
            "https://www.youtube.com/watch?v=PkZNo7MFNFg"
          ],
          resourceLink: [
            "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            "https://javascript.info/",
            "https://eloquentjavascript.net/"
          ]
        },
        {
          title: "Week 3: React Basics",
          description: "Get started with React.js by understanding components, props, and state. Learn about hooks like useState and useEffect. Explore conditional rendering, lists, and forms. Build your first React project: a dynamic weather app with API calls.",
          videoUrl: [
            "https://www.youtube.com/watch?v=bMknfKXIFA8",
            "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
            "https://www.youtube.com/watch?v=Tn6-PIqc4UM"
          ],
          resourceLink: [
            "https://reactjs.org/docs/getting-started.html",
            "https://www.w3schools.com/react/",
            "https://legacy.reactjs.org/docs/hooks-intro.html"
          ]
        },
        {
          title: "Week 4: Node.js & Express.js",
          description: "Discover server-side JavaScript using Node.js. Learn how to set up Express apps with routes, middleware, and REST APIs. Implement basic CRUD operations and understand HTTP request-response cycle. By the end, you’ll build a backend for a blog.",
          videoUrl: [
            "https://www.youtube.com/watch?v=Oe421EPjeBE",
            "https://www.youtube.com/watch?v=G8uL0lFFoN0",
            "https://www.youtube.com/watch?v=L72fhGm1tfE"
          ],
          resourceLink: [
            "https://expressjs.com/",
            "https://nodejs.dev/en/learn/",
            "https://www.freecodecamp.org/news/learn-node-js-full-course/"
          ]
        },
        {
          title: "Week 5: MongoDB & Mongoose",
          description: "Dive into MongoDB for NoSQL data storage and Mongoose for schema modeling. Learn how to connect, create models, and perform CRUD operations. Understand relationships, validations, and querying. Practice by building a course management DB.",
          videoUrl: [
            "https://www.youtube.com/watch?v=Of1pz-ZZNfA",
            "https://www.youtube.com/watch?v=2jqok-WgelI",
            "https://www.youtube.com/watch?v=oSIv-E60NiU"
          ],
          resourceLink: [
            "https://www.mongodb.com/docs/",
            "https://mongoosejs.com/docs/",
            "https://www.freecodecamp.org/news/introduction-to-mongoose-for-mongodb-d2a7aa593c57/"
          ]
        },
        {
          title: "Week 6: Authentication & Deployment",
          description: "Secure your apps with JWT-based authentication and password hashing. Implement protected routes and access control. Learn about environment variables. Then deploy your full stack project using Render, Vercel, or Netlify.",
          videoUrl: [
            "https://www.youtube.com/watch?v=2jqok-WgelI",
            "https://www.youtube.com/watch?v=mbsmsi7l3r4",
            "https://www.youtube.com/watch?v=4deVCNJq3qc"
          ],
          resourceLink: [
            "https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs",
            "https://vercel.com/docs",
            "https://render.com/docs/deploy-node-express-app"
          ]
        }
      ]
    },
    {
       name: "System Design Mastery",
  description: "A comprehensive guide to designing scalable, resilient, and maintainable software systems. This course takes you from the basics of system design all the way to designing real-world architectures like Twitter, Netflix, and distributed databases.",
  category: "Programming",
  difficulty: "Advanced",
  preRequisites: ["Data Structures", "Algorithms", "Networking", "OOP"],
  skillsGained: [
    "Scalability Planning",
    "Distributed Systems",
    "Database Design",
    "Load Balancing",
    "Caching Strategies",
    "Microservices",
    "API Design",
    "Real-world Architecture Patterns"
  ],
  eta: "6 weeks",
  createdAt: new Date(),
  badgeReward: 'Cyan',
  content: [
    {
      title: "Week 1: Introduction to System Design",
      description: "Understand what system design is and why it matters. Learn how to approach design interviews and problem-solving strategies. Cover scalability, latency, throughput, and CAP theorem fundamentals.",
      videoUrl: [
        "https://www.youtube.com/watch?v=xpDnVSmNFX0",
        "https://www.youtube.com/watch?v=UzLMhqg3_Wc",
        "https://www.youtube.com/watch?v=pjJHfa5yxlY"
      ],
      resourceLink: [
        "https://github.com/donnemartin/system-design-primer",
        "https://www.educative.io/courses/grokking-the-system-design-interview",
        "https://www.bytebytego.com/"
      ]
    },
    {
      title: "Week 2: Load Balancing & Caching",
      description: "Dive into load balancing algorithms and architectures. Understand caching strategies (write-through, write-back, etc.) and tools like Redis, Memcached. Apply these concepts to reduce latency and improve throughput.",
      videoUrl: [
        "https://www.youtube.com/watch?v=KkMZI5Jbf18",
        "https://www.youtube.com/watch?v=oaEJH2cRLRU",
        "https://www.youtube.com/watch?v=vx6vdRZGANQ"
      ],
      resourceLink: [
        "https://www.nginx.com/resources/glossary/load-balancing/",
        "https://redis.io/docs/latest/",
        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching"
      ]
    },
    {
      title: "Week 3: Database Design & Sharding",
      description: "Learn the difference between SQL and NoSQL. Understand data modeling, normalization, denormalization, and partitioning strategies. Explore horizontal vs vertical scaling and how sharding is implemented.",
      videoUrl: [
        "https://www.youtube.com/watch?v=ztHopE5Wnpc",
        "https://www.youtube.com/watch?v=w95Cyd5JQ7Y",
        "https://www.youtube.com/watch?v=d6PDlMggROA"
      ],
      resourceLink: [
        "https://docs.mongodb.com/manual/sharding/",
        "https://www.geeksforgeeks.org/database-sharding/",
        "https://www.linkedin.com/pulse/database-sharding-design-pattern-satish-chandra/"
      ]
    },
    {
      title: "Week 4: Designing APIs & Microservices",
      description: "Understand RESTful API design best practices, rate limiting, authentication, and documentation. Then move to microservices architecture, service discovery, message queues, and inter-service communication patterns.",
      videoUrl: [
        "https://www.youtube.com/watch?v=4GzFIV5ZPIw",
        "https://www.youtube.com/watch?v=G7ZJNFfN4nY",
        "https://www.youtube.com/watch?v=y8OnoxKotPQ"
      ],
      resourceLink: [
        "https://swagger.io/docs/specification/about/",
        "https://microservices.io/",
        "https://martinfowler.com/articles/microservices.html"
      ]
    },
    {
      title: "Week 5: Designing Real Systems",
      description: "Apply concepts to real-world systems: Design a URL shortener, Twitter feed, scalable chat app, or Netflix-like video streaming service. Analyze trade-offs and bottlenecks in architecture decisions.",
      videoUrl: [
        "https://www.youtube.com/watch?v=2kd0eGCddFo",
        "https://www.youtube.com/watch?v=nsykEIzY3zI",
        "https://www.youtube.com/watch?v=RZ3zDmmTqTc"
      ],
      resourceLink: [
        "https://www.educative.io/courses/grokking-the-system-design-interview",
        "https://github.com/checkcheckzz/system-design-interview",
        "https://github.com/madd86/awesome-system-design"
      ]
    },
    {
      title: "Week 6: Monitoring, Security & Deployment",
      description: "Cover system observability through logging, metrics, and tracing. Learn about security basics (encryption, HTTPS, access control). Understand CI/CD and deployment strategies like blue-green and canary releases.",
      videoUrl: [
        "https://www.youtube.com/watch?v=ELBGa5Z0C6w",
        "https://www.youtube.com/watch?v=FjE7Gn5fVYw",
        "https://www.youtube.com/watch?v=PaSYkZC-5VU"
      ],
      resourceLink: [
        "https://sre.google/",
        "https://www.cloudflare.com/learning/ddos/glossary/application-layer-attacks/",
        "https://www.redhat.com/en/topics/devops/what-is-ci-cd"
      ]
    }
  ]
    }
  ];

  await Course.insertMany(courses);
  console.log('Dummy course inserted!');
  mongoose.disconnect();
};

seedCourses();