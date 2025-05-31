require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model'); // Adjust the path as needed

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error:', err));

const seedUsers = async () => {
  await User.deleteMany(); // Uncomment to clear existing users

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      name: "Emily Johnson",
      email: "emily.johnson@example.com",
      password: hashedPassword,
      role: "employee",
      department: "Frontend",
      position: "UI/UX Designer",
      experience: 2,
      phone: "415-555-1234",
      skills: ["Figma", "CSS", "React", "Wireframing"],
      address: {
        street: "123 Oak St",
        city: "San Francisco",
        state: "CA",
        zipCode: "94107",
        country: "USA"
      },
      emergencyContact: {
        name: "Anna Johnson",
        relationship: "Sister",
        phone: "415-555-7890"
      },
      performanceMetrics: [
        {
          period: "2024-Q1",
          rating: 4.2,
          goals: [
            {
              title: "React Advanced Course",
              mode: "Training",
              description: "Master advanced React concepts",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-15")
            },
            {
              title: "Design System Project",
              mode: "Project",
              description: "Create company design system",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-25")
            }
          ],
          feedback: "Excellent progress in React development",
          reviewDate: new Date("2024-03-30"),
          badgesEarned: [
            {
              title: "Blue",
              type: "course",
              description: "Completed React Advanced Course",
              dateEarned: new Date("2024-03-15")
            },
            {
              title: "Purple",
              type: "project",
              description: "Design System Success",
              dateEarned: new Date("2024-03-25")
            }
          ]
        },
        {
          period: "2024-Q2",
          rating: 4.5,
          goals: [
            {
              title: "UX Research Course",
              mode: "Training",
              description: "Learn user research methods",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-06-10")
            }
          ],
          feedback: "Outstanding UX research skills",
          reviewDate: new Date("2024-06-30"),
          badgesEarned: [
            {
              title: "Cyan",
              type: "course",
              description: "UX Research Certification",
              dateEarned: new Date("2024-06-10")
            }
          ]
        }
      ]
    },
    {
      name: "Michael Thompson",
      email: "michael.thompson@example.com",
      password: hashedPassword,
      role: "manager",
      department: "Backend",
      position: "Team Lead",
      experience: 7,
      phone: "312-555-2233",
      skills: ["Node.js", "MongoDB", "AWS", "Project Management"],
      address: {
        street: "89 West Loop",
        city: "Chicago",
        state: "IL",
        zipCode: "60607",
        country: "USA"
      },
      emergencyContact: {
        name: "Rachel Thompson",
        relationship: "Wife",
        phone: "312-555-5678"
      },
      performanceMetrics: [
        {
          period: "2024-Q1",
          rating: 4.8,
          goals: [
            {
              title: "AWS Solutions Architect",
              mode: "Training",
              description: "AWS certification course",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-02-20")
            },
            {
              title: "Microservices Migration",
              mode: "Project",
              description: "Lead microservices migration",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-25")
            }
          ],
          feedback: "Exceptional leadership and technical skills",
          reviewDate: new Date("2024-03-30"),
          badgesEarned: [
            {
              title: "Red",
              type: "course",
              description: "AWS Solutions Architect Certified",
              dateEarned: new Date("2024-02-20")
            },
            {
              title: "Red",
              type: "project",
              description: "Microservices Migration Success",
              dateEarned: new Date("2024-03-25")
            }
          ]
        },
        {
          period: "2024-Q2",
          rating: 4.7,
          goals: [
            {
              title: "Leadership Workshop",
              mode: "Training",
              description: "Advanced leadership training",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-05-15")
            }
          ],
          feedback: "Continues to excel in team leadership",
          reviewDate: new Date("2024-06-30"),
          badgesEarned: [
            {
              title: "Purple",
              type: "course",
              description: "Leadership Excellence",
              dateEarned: new Date("2024-05-15")
            }
          ]
        }
      ]
    },
    {
      name: "Sophia Davis",
      email: "sophia.davis@example.com",
      password: hashedPassword,
      role: "employee",
      department: "Hardware",
      position: "Embedded Systems Engineer",
      experience: 3,
      phone: "617-555-3344",
      skills: ["C++", "Microcontrollers", "IoT", "Circuit Design"],
      address: {
        street: "456 Beacon St",
        city: "Boston",
        state: "MA",
        zipCode: "02116",
        country: "USA"
      },
      emergencyContact: {
        name: "David Davis",
        relationship: "Brother",
        phone: "617-555-1122"
      },
      performanceMetrics: [
        {
          period: "2024-Q1",
          rating: 4.0,
          goals: [
            {
              title: "IoT Fundamentals",
              mode: "Training",
              description: "IoT protocols and implementation",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-02-28")
            },
            {
              title: "Smart Sensor Development",
              mode: "Project",
              description: "Develop IoT sensors",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-20")
            }
          ],
          feedback: "Good progress in IoT development",
          reviewDate: new Date("2024-03-30"),
          badgesEarned: [
            {
              title: "Cyan",
              type: "course",
              description: "IoT Fundamentals Completed",
              dateEarned: new Date("2024-02-28")
            },
            {
              title: "Blue",
              type: "project",
              description: "Smart Sensor Success",
              dateEarned: new Date("2024-03-20")
            }
          ]
        }
      ]
    },
    {
      name: "James Walker",
      email: "james.walker@example.com",
      password: hashedPassword,
      role: "admin",
      department: "IT",
      position: "System Administrator",
      experience: 10,
      phone: "646-555-6677",
      skills: ["Linux", "Networking", "Security", "Docker"],
      address: {
        street: "789 7th Ave",
        city: "New York",
        state: "NY",
        zipCode: "10019",
        country: "USA"
      },
      emergencyContact: {
        name: "Laura Walker",
        relationship: "Mother",
        phone: "646-555-8899"
      },
      performanceMetrics: [
        {
          period: "2024-Q1",
          rating: 4.9,
          goals: [
            {
              title: "Kubernetes Administration",
              mode: "Training",
              description: "Master Kubernetes orchestration",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-01-30")
            },
            {
              title: "Infrastructure Modernization",
              mode: "Project",
              description: "Modernize company infrastructure",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-15")
            }
          ],
          feedback: "Exceptional infrastructure leadership",
          reviewDate: new Date("2024-03-30"),
          badgesEarned: [
            {
              title: "Red",
              type: "course",
              description: "Kubernetes Master",
              dateEarned: new Date("2024-01-30")
            },
            {
              title: "Red",
              type: "project",
              description: "Infrastructure Excellence",
              dateEarned: new Date("2024-03-15")
            }
          ]
        },
        {
          period: "2024-Q2",
          rating: 4.8,
          goals: [
            {
              title: "Cybersecurity Advanced",
              mode: "Training",
              description: "Advanced security protocols",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-04-20")
            }
          ],
          feedback: "Outstanding security implementation",
          reviewDate: new Date("2024-06-30"),
          badgesEarned: [
            {
              title: "Red",
              type: "course",
              description: "Cybersecurity Expert",
              dateEarned: new Date("2024-04-20")
            }
          ]
        }
      ]
    },
    {
      name: "Ava Martinez",
      email: "ava.martinez@example.com",
      password: hashedPassword,
      role: "employee",
      department: "Quality Assurance",
      position: "QA Tester",
      experience: 1,
      phone: "206-555-9087",
      skills: ["Manual Testing", "Jest", "Cypress", "Bug Tracking"],
      address: {
        street: "321 Pine St",
        city: "Seattle",
        state: "WA",
        zipCode: "98101",
        country: "USA"
      },
      emergencyContact: {
        name: "Carlos Martinez",
        relationship: "Father",
        phone: "206-555-7777"
      },
      performanceMetrics: [
        {
          period: "2024-Q1",
          rating: 3.8,
          goals: [
            {
              title: "Automated Testing Basics",
              mode: "Training",
              description: "Learn automated testing fundamentals",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-10")
            },
            {
              title: "Mobile App Testing",
              mode: "Project",
              description: "Test mobile application",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-25")
            }
          ],
          feedback: "Good foundation in testing principles",
          reviewDate: new Date("2024-03-30"),
          badgesEarned: [
            {
              title: "Green",
              type: "course",
              description: "Testing Basics Completed",
              dateEarned: new Date("2024-03-10")
            },
            {
              title: "Cyan",
              type: "project",
              description: "Mobile Testing Success",
              dateEarned: new Date("2024-03-25")
            }
          ]
        }
      ]
    },
    {
      name: "Daniel Thompson",
      email: "daniel.thompson@techcore.com",
      password: hashedPassword,
      role: "manager",
      department: "IT Operations",
      position: "Infrastructure Manager",
      experience: 9,
      joinDate: new Date("2016-02-12"),
      phone: "303-555-7864",
      skills: ["DevOps", "Linux Administration", "Cloud Infrastructure"],
      address: {
        street: "7890 Fox Hill Rd",
        city: "Denver",
        state: "CO",
        zipCode: "80203",
        country: "USA"
      },
      emergencyContact: {
        name: "Erica Thompson",
        relationship: "Spouse",
        phone: "303-555-1248"
      },
      performanceMetrics: [
        {
          period: "2024-Q1",
          rating: 4.6,
          goals: [
            {
              title: "DevOps Best Practices",
              mode: "Training",
              description: "Advanced DevOps methodologies",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-02-15")
            },
            {
              title: "CI/CD Pipeline",
              mode: "Project",
              description: "Implement automated CI/CD",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-20")
            }
          ],
          feedback: "Excellent DevOps implementation",
          reviewDate: new Date("2024-03-30"),
          badgesEarned: [
            {
              title: "Purple",
              type: "course",
              description: "DevOps Expert",
              dateEarned: new Date("2024-02-15")
            },
            {
              title: "Red",
              type: "project",
              description: "CI/CD Excellence",
              dateEarned: new Date("2024-03-20")
            }
          ]
        }
      ]
    },
    {
      name: "Rachel Perez",
      email: "rachel.perez@hardnova.com",
      password: hashedPassword,
      role: "employee",
      department: "Hardware",
      position: "Hardware Test Engineer",
      experience: 2,
      joinDate: new Date("2023-03-15"),
      phone: "619-555-2231",
      skills: ["Circuit Analysis", "Embedded Systems", "Testing"],
      address: {
        street: "981 Lincoln Ave",
        city: "San Diego",
        state: "CA",
        zipCode: "92103",
        country: "USA"
      },
      emergencyContact: {
        name: "Luis Perez",
        relationship: "Brother",
        phone: "619-555-4455"
      },
      performanceMetrics: [
        {
          period: "2024-Q1",
          rating: 3.9,
          goals: [
            {
              title: "Hardware Testing Methods",
              mode: "Training",
              description: "Learn testing methodologies",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-05")
            },
            {
              title: "PCB Testing Automation",
              mode: "Project",
              description: "Automate PCB testing",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-22")
            }
          ],
          feedback: "Good progress in testing automation",
          reviewDate: new Date("2024-03-30"),
          badgesEarned: [
            {
              title: "Cyan",
              type: "course",
              description: "Testing Methods Certified",
              dateEarned: new Date("2024-03-05")
            },
            {
              title: "Blue",
              type: "project",
              description: "PCB Automation Success",
              dateEarned: new Date("2024-03-22")
            }
          ]
        }
      ]
    },
    {
      name: "Henry Lee",
      email: "henry.lee@softforge.com",
      password: hashedPassword,
      role: "manager",
      department: "Software Development",
      position: "Tech Lead",
      experience: 7,
      joinDate: new Date("2018-07-11"),
      phone: "415-555-6521",
      skills: ["System Architecture", "Microservices", "Node.js", "MongoDB"],
      address: {
        street: "2222 18th Ave",
        city: "San Francisco",
        state: "CA",
        zipCode: "94116",
        country: "USA"
      },
      emergencyContact: {
        name: "Alice Lee",
        relationship: "Mother",
        phone: "415-555-9823"
      },
      performanceMetrics: [
        {
          period: "2024-Q1",
          rating: 4.7,
          goals: [
            {
              title: "System Architecture Design",
              mode: "Training",
              description: "Advanced architecture patterns",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-02-10")
            },
            {
              title: "Scalable API Development",
              mode: "Project",
              description: "Build scalable REST API",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-18")
            }
          ],
          feedback: "Outstanding architectural decisions",
          reviewDate: new Date("2024-03-30"),
          badgesEarned: [
            {
              title: "Red",
              type: "course",
              description: "Architecture Master",
              dateEarned: new Date("2024-02-10")
            },
            {
              title: "Purple",
              type: "project",
              description: "Scalable API Excellence",
              dateEarned: new Date("2024-03-18")
            }
          ]
        }
      ]
    },
    {
      name: "Natalie Evans",
      email: "natalie.evans@digitronix.com",
      password: hashedPassword,
      role: "employee",
      department: "Product Design",
      position: "UI/UX Designer",
      experience: 4,
      joinDate: new Date("2021-09-30"),
      phone: "646-555-7019",
      skills: ["Figma", "User Research", "Prototyping", "Accessibility"],
      address: {
        street: "160 W 73rd St",
        city: "New York",
        state: "NY",
        zipCode: "10023",
        country: "USA"
      },
      emergencyContact: {
        name: "Sophie Evans",
        relationship: "Sister",
        phone: "646-555-1129"
      },
      performanceMetrics: [
        {
          period: "2024-Q1",
          rating: 4.4,
          goals: [
            {
              title: "Accessibility Design",
              mode: "Training",
              description: "WCAG guidelines and accessible design",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-02-25")
            },
            {
              title: "Dashboard Redesign",
              mode: "Project",
              description: "Redesign admin dashboard",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-30")
            }
          ],
          feedback: "Excellent accessibility implementation",
          reviewDate: new Date("2024-03-30"),
          badgesEarned: [
            {
              title: "Blue",
              type: "course",
              description: "Accessibility Expert",
              dateEarned: new Date("2024-02-25")
            },
            {
              title: "Purple",
              type: "project",
              description: "Dashboard Redesign Success",
              dateEarned: new Date("2024-03-30")
            }
          ]
        }
      ]
    },
    {
      name: "Marcus Green",
      email: "marcus.green@firmix.com",
      password: hashedPassword,
      role: "employee",
      department: "Customer Support",
      position: "Support Engineer",
      experience: 3,
      joinDate: new Date("2022-01-05"),
      phone: "407-555-8103",
      skills: ["Customer Service", "Troubleshooting", "Ticketing Systems"],
      address: {
        street: "421 Pine Needle Ct",
        city: "Orlando",
        state: "FL",
        zipCode: "32801",
        country: "USA"
      },
      emergencyContact: {
        name: "Deborah Green",
        relationship: "Mother",
        phone: "407-555-1012"
      },
      performanceMetrics: [
        {
          period: "2024-Q1",
          rating: 4.2,
          goals: [
            {
              title: "Advanced Customer Service",
              mode: "Training",
              description: "Customer service excellence",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-02-20")
            },
            {
              title: "Support Process Optimization",
              mode: "Project",
              description: "Optimize ticket resolution",
              refId: new mongoose.Types.ObjectId(),
              status: "completed",
              completedAt: new Date("2024-03-25")
            }
          ],
          feedback: "Excellent customer service skills",
          reviewDate: new Date("2024-03-30"),
          badgesEarned: [
            {
              title: "Cyan",
              type: "course",
              description: "Customer Service Excellence",
              dateEarned: new Date("2024-02-20")
            },
            {
              title: "Blue",
              type: "project",
              description: "Process Optimization Success",
              dateEarned: new Date("2024-03-25")
            }
          ]
        }
      ]
    }
  ];

  try {
    // Use individual saves instead of insertMany for nested arrays
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Saved user: ${user.name}`);
    }
    
    console.log('🎉 Users with performance metrics seeded successfully!');
    
    // Verify the data was saved
    const savedUsers = await User.find({}).select('name performanceMetrics');
    console.log('\n📊 Verification:');
    savedUsers.forEach(user => {
      const totalBadges = user.performanceMetrics.reduce((total, metric) => 
        total + (metric.badgesEarned ? metric.badgesEarned.length : 0), 0
      );
      console.log(`${user.name}: ${user.performanceMetrics.length} periods, ${totalBadges} badges`);
    });
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedUsers();
