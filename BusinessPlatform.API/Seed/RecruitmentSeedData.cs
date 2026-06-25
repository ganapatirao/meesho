using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using MongoDB.Driver;

namespace BusinessPlatform.API.Seed
{
    public class RecruitmentSeedData
    {
        private readonly MongoDbContext _context;

        public RecruitmentSeedData(MongoDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            await _context.Jobs.DeleteManyAsync(_ => true);
            await _context.JobApplications.DeleteManyAsync(_ => true);
            await _context.Candidates.DeleteManyAsync(_ => true);

            // Seed Jobs (India-specific)
            var jobs = new[]
            {
                new Job { Title = "Senior Software Engineer", Company = "Tata Consultancy Services", Location = "Bangalore", Salary = "15-25 LPA", Type = "Full-time", Experience = "5-10 Years", Description = "We are looking for an experienced software engineer to join our team. You will be responsible for designing and implementing scalable software solutions using modern technologies.", Requirements = "B.Tech/M.Tech in Computer Science with 5+ years of experience in full-stack development.", Skills = new List<string> { "C#", ".NET", "React", "MongoDB", "Azure", "Microservices" } },
                new Job { Title = "Product Manager", Company = "Infosys", Location = "Hyderabad", Salary = "12-20 LPA", Type = "Full-time", Experience = "3-5 Years", Description = "Lead product development and strategy for our SaaS platform. Work closely with cross-functional teams to deliver exceptional user experiences.", Requirements = "MBA with 3+ years of product management experience in tech industry.", Skills = new List<string> { "Product Management", "Agile", "Strategy", "Roadmap Planning", "User Research" } },
                new Job { Title = "UX Designer", Company = "Wipro", Location = "Pune", Salary = "8-15 LPA", Type = "Full-time", Experience = "2-4 Years", Description = "Create beautiful and intuitive user experiences for our clients. Design user-centered solutions for web and mobile applications.", Requirements = "Degree in Design with 2+ years of UX design experience.", Skills = new List<string> { "Figma", "UI/UX", "Prototyping", "User Research", "Design Systems" } },
                new Job { Title = "Data Analyst Intern", Company = "HCL Technologies", Location = "Chennai", Salary = "3-6 LPA", Type = "Internship", Experience = "Fresher", Description = "Learn data analysis and visualization techniques while working on real-world projects. Great opportunity for freshers to kickstart their career.", Requirements = "B.Tech/M.Tech in CS/IT or related field with strong analytical skills.", Skills = new List<string> { "Python", "SQL", "Excel", "Power BI", "Data Visualization" } },
                new Job { Title = "DevOps Engineer", Company = "Reliance Jio", Location = "Mumbai", Salary = "18-30 LPA", Type = "Full-time", Experience = "5-10 Years", Description = "Build and maintain cloud infrastructure and CI/CD pipelines. Ensure high availability and scalability of our services.", Requirements = "B.Tech/M.Tech with 5+ years of DevOps experience.", Skills = new List<string> { "AWS", "Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible" } },
                new Job { Title = "Frontend Developer", Company = "Flipkart", Location = "Bangalore", Salary = "10-18 LPA", Type = "Full-time", Experience = "2-4 Years", Description = "Build responsive and performant web applications using React and modern JavaScript frameworks.", Requirements = "B.Tech with 2+ years of frontend development experience.", Skills = new List<string> { "React", "TypeScript", "JavaScript", "CSS", "Redux", "Next.js" } },
                new Job { Title = "Backend Developer", Company = "Zomato", Location = "Delhi NCR", Salary = "12-20 LPA", Type = "Full-time", Experience = "3-5 Years", Description = "Design and implement scalable backend services using Node.js and Python. Work on high-traffic systems serving millions of users.", Requirements = "B.Tech/M.Tech with 3+ years of backend development experience.", Skills = new List<string> { "Node.js", "Python", "PostgreSQL", "Redis", "Microservices", "API Design" } },
                new Job { Title = "Mobile App Developer", Company = "Paytm", Location = "Noida", Salary = "10-18 LPA", Type = "Full-time", Experience = "2-4 Years", Description = "Develop native and cross-platform mobile applications for iOS and Android. Build seamless user experiences for millions of users.", Requirements = "B.Tech with 2+ years of mobile app development experience.", Skills = new List<string> { "React Native", "Flutter", "iOS", "Android", "Kotlin", "Swift" } },
                new Job { Title = "Machine Learning Engineer", Company = "Google India", Location = "Bangalore", Salary = "25-40 LPA", Type = "Full-time", Experience = "5-10 Years", Description = "Build and deploy machine learning models at scale. Work on cutting-edge AI projects impacting billions of users.", Requirements = "PhD/M.Tech in ML/AI with 5+ years of industry experience.", Skills = new List<string> { "Python", "TensorFlow", "PyTorch", "Deep Learning", "NLP", "MLOps" } },
                new Job { Title = "Quality Assurance Engineer", Company = "Amazon India", Location = "Hyderabad", Salary = "8-15 LPA", Type = "Full-time", Experience = "2-4 Years", Description = "Ensure software quality through comprehensive testing strategies. Develop automated test frameworks and manual testing processes.", Requirements = "B.Tech with 2+ years of QA experience.", Skills = new List<string> { "Selenium", "Java", "TestNG", "API Testing", "Performance Testing", "JIRA" } },
                new Job { Title = "Full Stack Developer", Company = "Microsoft India", Location = "Bangalore", Salary = "15-25 LPA", Type = "Full-time", Experience = "3-5 Years", Description = "Work on full-stack development projects using Microsoft technologies. Build scalable web applications and services.", Requirements = "B.Tech/M.Tech with 3+ years of full-stack development experience.", Skills = new List<string> { ".NET", "C#", "React", "Azure", "SQL Server", "TypeScript" } },
                new Job { Title = "Cloud Architect", Company = "IBM India", Location = "Kolkata", Salary = "20-35 LPA", Type = "Full-time", Experience = "8-12 Years", Description = "Design and implement cloud infrastructure solutions. Lead cloud migration projects and ensure best practices.", Requirements = "B.Tech/M.Tech with 8+ years of cloud architecture experience.", Skills = new List<string> { "AWS", "Azure", "GCP", "Kubernetes", "Terraform", "Cloud Security" } },
                new Job { Title = "Technical Lead", Company = "Adobe India", Location = "Noida", Salary = "25-40 LPA", Type = "Full-time", Experience = "8-12 Years", Description = "Lead technical teams and drive architectural decisions. Mentor junior developers and ensure code quality.", Requirements = "B.Tech/M.Tech with 8+ years of software development experience.", Skills = new List<string> { "Leadership", "Architecture", "Java", "Spring Boot", "Microservices", "Agile" } },
                new Job { Title = "Data Scientist", Company = "Accenture India", Location = "Mumbai", Salary = "15-25 LPA", Type = "Full-time", Experience = "4-6 Years", Description = "Analyze complex datasets and build predictive models. Drive data-driven decision making across the organization.", Requirements = "M.Tech/PhD in Data Science with 4+ years of experience.", Skills = new List<string> { "Python", "R", "Machine Learning", "Statistics", "SQL", "Tableau" } },
                new Job { Title = "Cyber Security Analyst", Company = "Cisco India", Location = "Bangalore", Salary = "12-22 LPA", Type = "Full-time", Experience = "3-5 Years", Description = "Protect organization's digital assets and ensure security compliance. Monitor and respond to security incidents.", Requirements = "B.Tech/M.Tech with 3+ years of cybersecurity experience.", Skills = new List<string> { "Network Security", "Penetration Testing", "SIEM", "Incident Response", "Compliance" } }
            };
            await _context.Jobs.InsertManyAsync(jobs);

            // Seed Candidates
            var candidates = new[]
            {
                new Candidate { Name = "John Smith", Email = "john@example.com", Phone = "+1-555-0101", Experience = "6 years", Skills = new List<string> { "C#", ".NET", "React", "MongoDB" }, Resume = "john_smith_resume.pdf" },
                new Candidate { Name = "Jane Doe", Email = "jane@example.com", Phone = "+1-555-0102", Experience = "5 years", Skills = new List<string> { "Product Management", "Agile", "Strategy" }, Resume = "jane_doe_resume.pdf" },
                new Candidate { Name = "Bob Wilson", Email = "bob@example.com", Phone = "+1-555-0103", Experience = "4 years", Skills = new List<string> { "Figma", "UI/UX", "Prototyping" }, Resume = "bob_wilson_resume.pdf" }
            };
            await _context.Candidates.InsertManyAsync(candidates);
        }
    }
}
