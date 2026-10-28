package com.library.Resource.Sharing.Library.Management.configuration;

import com.library.Resource.Sharing.Library.Management.enums.BadgeRequirementType;
import com.library.Resource.Sharing.Library.Management.enums.CommunitymemberRole;
import com.library.Resource.Sharing.Library.Management.enums.FileType;
import com.library.Resource.Sharing.Library.Management.enums.UserRole;
import com.library.Resource.Sharing.Library.Management.model.*;
import com.library.Resource.Sharing.Library.Management.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Configuration
public class SeedDb {

    private static final Logger LOGGER = LoggerFactory.getLogger(SeedDb.class);

    @Bean
    CommandLineRunner seedData(
        UserRepository userRepository,
        AuthorRepository authorRepository,
        BookRepository bookRepository,
        CommentRepository commentRepository,
        RatingRepository ratingRepository,
        WishlistRepository wishlistRepository,
        PasswordEncoder passwordEncoder,
        BadgeRepository badgeRepository,
        UserBadgeRepository userBadgeRepository,
        CommunityRepository communityRepository,
        CommunityMembersRepository communityMembersRepository,
        AuthorFollowRepository authorFollowRepository
    ) {
        return new CommandLineRunner() {
            @Override
            public void run(String... args) throws Exception {
                // Ensure existing communities have their creator registered as OWNER if missing
                for (Communities comm : communityRepository.findAll()) {
                    if (comm.getCreatedBy() != null && !communityMembersRepository.existsByCommunities_CommunityIdAndUser_UserId(comm.getCommunityId(), comm.getCreatedBy().getUserId())) {
                        CommunityMembers ownerMember = CommunityMembers.builder()
                                .communities(comm)
                                .user(comm.getCreatedBy())
                                .role(CommunitymemberRole.OWNER)
                                .build();
                        communityMembersRepository.save(ownerMember);
                        LOGGER.info("Enrolled community creator {} as OWNER of community {}", comm.getCreatedBy().getUserId(), comm.getCommunityId());
                    }
                }

                User primaryUser = seedUsers(userRepository, passwordEncoder);
                List<Author> authors = seedAuthors(authorRepository);
                List<Book> books = seedBooks(bookRepository, authors, primaryUser);
                seedAuthorFollows(authorFollowRepository, primaryUser, authors);
                seedRatings(ratingRepository, books, primaryUser);
                seedComments(commentRepository, books, primaryUser);
                seedWishlist(wishlistRepository, books, primaryUser);
                seedBadges(badgeRepository, userBadgeRepository, primaryUser);
                seedCommunities(communityRepository, communityMembersRepository, primaryUser);

                LOGGER.info("Completed seeding real-world library catalog and scholarly community data.");
            }
        };
    }

    private User seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        User primaryUser = userRepository.findByEmail("gunanihil3@gmail.com").orElse(null);
        if (primaryUser == null) {
            primaryUser = User.builder()
                    .email("gunanihil3@gmail.com")
                    .password(passwordEncoder.encode("Guna@1234"))
                    .phone("7695862878")
                    .username("Gunanihil")
                    .role(UserRole.ADMIN)
                    .profileUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80")
                    .build();
            primaryUser = userRepository.save(primaryUser);
            LOGGER.info("Seeded primary user gunanihil3@gmail.com");
        }

        if (!userRepository.existsByEmail("scholar@university.edu")) {
            User scholar = User.builder()
                    .email("scholar@university.edu")
                    .password(passwordEncoder.encode("Password123!"))
                    .phone("1234567890")
                    .username("LeadScholar")
                    .role(UserRole.USER)
                    .profileUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80")
                    .build();
            userRepository.save(scholar);
            LOGGER.info("Seeded scholar user scholar@university.edu");
        }

        if (!userRepository.existsByEmail("admin@library.enterprise.edu")) {
            User admin = User.builder()
                    .email("admin@library.enterprise.edu")
                    .password(passwordEncoder.encode("Password123!"))
                    .phone("9876543210")
                    .username("LibraryAdmin")
                    .role(UserRole.ADMIN)
                    .profileUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80")
                    .build();
            userRepository.save(admin);
            LOGGER.info("Seeded admin user admin@library.enterprise.edu");
        }

        return primaryUser;
    }

    private List<Author> seedAuthors(AuthorRepository authorRepository) {
        List<Author> existing = authorRepository.findAll();
        // Check if legacy "Test author" exists, upgrade it to Martin Kleppmann
        for (Author a : existing) {
            if ("Test author".equalsIgnoreCase(a.getName())) {
                a.setName("Martin Kleppmann");
                a.setBio("Associate Professor of Computer Science at the University of Cambridge. Author of Designing Data-Intensive Applications and researcher on distributed systems, local-first software, and CRDTs.");
                a.setProfileUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80");
                authorRepository.save(a);
                LOGGER.info("Upgraded legacy Test author to Martin Kleppmann");
            }
        }

        String[][] authorData = {
            {"Martin Kleppmann", "Associate Professor of Computer Science at the University of Cambridge. Author of Designing Data-Intensive Applications and researcher on distributed systems, local-first software, and CRDTs.", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"},
            {"Robert C. Martin", "Legendary software craftsman, co-author of the Agile Manifesto, and creator of SOLID design principles. Author of Clean Code, Clean Architecture, and The Clean Coder.", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"},
            {"Thomas H. Cormen", "Professor Emeritus of Computer Science at Dartmouth College and co-author of the canonical worldwide algorithms textbook Introduction to Algorithms (CLRS).", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80"},
            {"Ian Goodfellow", "World-renowned machine learning scientist, inventor of Generative Adversarial Networks (GANs), and lead author of the definitive MIT Press textbook Deep Learning.", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"},
            {"Stuart Russell", "Professor of Computer Science at UC Berkeley, director of the Center for Human-Compatible AI, and co-author of Artificial Intelligence: A Modern Approach (AIMA).", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80"},
            {"Betsy Beyer", "Principal Reliability Engineer and Editor at Google. Lead editor of Site Reliability Engineering: How Google Runs Production Systems.", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"},
            {"Abraham Silberschatz", "Sidney J. Weinberg Professor of Computer Science at Yale University. Author of world-standard textbooks Operating System Concepts and Database System Concepts.", "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"},
            {"Michael A. Nielsen", "Quantum physicist and computer scientist. Co-author of Quantum Computation and Quantum Information, the standard worldwide reference in quantum computing.", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80"}
        };

        List<Author> results = new ArrayList<>();
        List<Author> currentAuthors = authorRepository.findAll();

        for (String[] ad : authorData) {
            String name = ad[0];
            Optional<Author> existingAuthor = currentAuthors.stream().filter(a -> name.equalsIgnoreCase(a.getName())).findFirst();
            if (existingAuthor.isPresent()) {
                results.add(existingAuthor.get());
            } else {
                Author created = authorRepository.save(Author.builder()
                        .name(name)
                        .bio(ad[1])
                        .profileUrl(ad[2])
                        .build());
                results.add(created);
                LOGGER.info("Seeded author {}", name);
            }
        }
        return results;
    }

    private List<Book> seedBooks(BookRepository bookRepository, List<Author> authors, User uploader) {
        List<Book> existingBooks = bookRepository.findAll();

        // Check if legacy "Book 1" exists, upgrade it to Designing Data-Intensive Applications
        for (Book b : existingBooks) {
            if ("Book 1".equalsIgnoreCase(b.getTitle())) {
                b.setTitle("Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems");
                b.setDescription("An exhaustive enterprise guide covering Paxos, Raft, event-driven microservices, storage engines, replication, partitioning, transactions, consensus, batch processing, and stream processing.");
                b.setPages(616);
                b.setCategory("Distributed Systems");
                b.setTags("Distributed Systems, Databases, Replication, Kafka, Data Engineering, Consensus");
                b.setCoverUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80");
                if (!authors.isEmpty()) {
                    b.setAuthor(authors.get(0));
                }
                bookRepository.save(b);
                LOGGER.info("Upgraded legacy Book 1 to Designing Data-Intensive Applications");
            }
        }

        record BookSeed(String title, String description, int pages, String category, String tags, String coverUrl, int authorIndex) {}

        List<BookSeed> seeds = List.of(
            new BookSeed(
                "Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems",
                "Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. Martin Kleppmann examines storage engines, replication, partitioning, transactions, consensus, batch processing, and stream processing.",
                616, "Distributed Systems", "Distributed Systems, Databases, Replication, Kafka, Data Engineering, Consensus",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80", 0
            ),
            new BookSeed(
                "Clean Code: A Handbook of Agile Software Craftsmanship",
                "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Robert C. Martin presents a revolutionary paradigm with Clean Code, teaching meaningful naming, function design, error handling, unit testing, and continuous refactoring.",
                464, "Software Engineering", "Software Craftsmanship, Clean Code, Design Patterns, Refactoring, Agile, Testing",
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80", 1
            ),
            new BookSeed(
                "Introduction to Algorithms (Fourth Edition - CLRS)",
                "The leading textbook in algorithms worldwide, used by top universities and researchers. Comprehensive and rigorous coverage of divide-and-conquer, dynamic programming, greedy algorithms, advanced data structures, B-trees, Fibonacci heaps, graph algorithms, maximum flow, multithreaded algorithms, and NP-completeness.",
                1312, "Computer Science", "Algorithms, Data Structures, Graph Theory, Dynamic Programming, Mathematics, Complexity",
                "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80", 2
            ),
            new BookSeed(
                "Deep Learning (Adaptive Computation and Machine Learning series)",
                "The definitive MIT Press textbook on deep learning by Ian Goodfellow, Yoshua Bengio, and Aaron Courville. Introduces mathematical and conceptual foundations: linear algebra, probability, numerical computation, deep feedforward networks, regularization, optimization, convolutional networks, and generative models.",
                800, "Artificial Intelligence", "Artificial Intelligence, Deep Learning, Neural Networks, Machine Learning, Mathematics",
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", 3
            ),
            new BookSeed(
                "Artificial Intelligence: A Modern Approach (Fourth Edition)",
                "The most widely adopted textbook in artificial intelligence. Explores the full spectrum of AI, from informed search, constraint satisfaction, and adversarial game playing, to probabilistic reasoning, reinforcement learning, deep learning, natural language processing, computer vision, and AI safety.",
                1152, "Artificial Intelligence", "Artificial Intelligence, Machine Learning, Robotics, NLP, Logic, Search, Ethics",
                "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80", 4
            ),
            new BookSeed(
                "Site Reliability Engineering: How Google Runs Production Systems",
                "The pioneering collection of essays and blueprints by key members of Google's Site Reliability Engineering team. Explains principles enabling Google to build, deploy, monitor, and maintain ultra-reliable software systems: SLA/SLO definition, canary rollouts, incident management, and distributed monitoring.",
                550, "Cloud Engineering", "DevOps, SRE, Cloud, Distributed Systems, Kubernetes, Observability, Monitoring",
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", 5
            ),
            new BookSeed(
                "Database System Concepts (Seventh Edition)",
                "The fundamental text on database architecture, relational models, SQL standards, indexing and hashing (B+ Trees), query processing and optimization, ACID transaction semantics, concurrency control protocols, recovery systems, and modern distributed database engines.",
                1376, "Database Systems", "Databases, SQL, Indexing, Transactions, Concurrency, Distributed Systems",
                "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80", 6
            ),
            new BookSeed(
                "Quantum Computation and Quantum Information (10th Anniversary Edition)",
                "The canonical textbook that established the field of quantum computing. Explains quantum circuits, quantum Fourier transforms, Shor's factoring algorithm, Grover's database search, quantum error correction, fault tolerance, and quantum cryptography protocols like BB84.",
                702, "Applied Physics & Mathematics", "Quantum Computing, Quantum Information, Physics, Cryptography, Algorithms",
                "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80", 7
            ),
            new BookSeed(
                "Operating System Concepts (10th Edition - Dinosaur Book)",
                "The world-renowned Dinosaur Book covers processes, threads, CPU scheduling, synchronization primitives (mutexes, semaphores, monitors), deadlock prevention, virtual memory paging, file system implementation, I/O systems, and security in Unix/Linux and Windows kernels.",
                1000, "Computer Science", "Operating Systems, Linux, Kernel, Concurrency, Memory Management, Virtualization",
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", 6
            )
        );

        List<Book> results = new ArrayList<>();
        List<Book> freshBooks = bookRepository.findAll();

        for (BookSeed bs : seeds) {
            Optional<Book> found = freshBooks.stream().filter(b -> bs.title().equalsIgnoreCase(b.getTitle())).findFirst();
            if (found.isPresent()) {
                results.add(found.get());
            } else {
                Author author = bs.authorIndex() < authors.size() ? authors.get(bs.authorIndex()) : authors.get(0);
                Book created = bookRepository.save(Book.builder()
                        .title(bs.title())
                        .description(bs.description())
                        .pages(bs.pages())
                        .category(bs.category())
                        .tags(bs.tags())
                        .coverUrl(bs.coverUrl())
                        .fileUrl("https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf")
                        .fileType(FileType.PDF)
                        .author(author)
                        .uploadedBy(uploader)
                        .build());
                results.add(created);
                LOGGER.info("Seeded real book: {}", bs.title());
            }
        }
        return results;
    }

    private void seedAuthorFollows(AuthorFollowRepository authorFollowRepository, User user, List<Author> authors) {
        if (authors.isEmpty() || user == null) return;
        for (int i = 0; i < Math.min(3, authors.size()); i++) {
            Author author = authors.get(i);
            if (!authorFollowRepository.existsByUser_UserIdAndAuthor_AuthorId(user.getUserId(), author.getAuthorId())) {
                authorFollowRepository.save(AuthorFollow.builder()
                        .user(user)
                        .author(author)
                        .build());
                LOGGER.info("Enrolled user {} as follower of author {}", user.getUserId(), author.getName());
            }
        }
    }

    private void seedRatings(RatingRepository ratingRepository, List<Book> books, User user) {
        if (books.isEmpty() || user == null) return;
        List<Ratings> existing = ratingRepository.findAll();
        // Upgrade legacy "Review for book 1"
        for (Ratings r : existing) {
            if ("Review for book 1".equalsIgnoreCase(r.getReview())) {
                r.setReview("Essential reading for distributed systems engineering. The Paxos invariants and consensus failure scenarios are explained with crystal clarity.");
                r.setRating(5L);
                ratingRepository.save(r);
            }
        }

        String[][] reviews = {
            {"Essential reading for distributed systems engineering. The Paxos invariants and consensus failure scenarios are explained with crystal clarity.", "5"},
            {"A timeless guide on writing maintainable and resilient software. The refactoring and naming chapters are gold.", "5"},
            {"The canonical reference for algorithms and data structures. Highly rigorous proofs and comprehensive analysis.", "5"},
            {"The mathematical derivations of backpropagation and deep convolutional networks are second to none.", "5"},
            {"Masterpiece textbook exploring modern AI and search techniques. Essential for graduate scholars.", "5"}
        };

        for (int i = 0; i < Math.min(reviews.length, books.size()); i++) {
            Book book = books.get(i);
            boolean alreadyRated = ratingRepository.findAll().stream()
                    .anyMatch(r -> r.getBook() != null && r.getBook().getBookId().equals(book.getBookId()) && r.getUser() != null && r.getUser().getUserId().equals(user.getUserId()));
            if (!alreadyRated) {
                ratingRepository.save(Ratings.builder()
                        .book(book)
                        .user(user)
                        .rating(Long.parseLong(reviews[i][1]))
                        .review(reviews[i][0])
                        .build());
                LOGGER.info("Seeded review for book: {}", book.getTitle());
            }
        }
    }

    private void seedComments(CommentRepository commentRepository, List<Book> books, User user) {
        if (books.isEmpty() || user == null) return;
        List<Comments> existing = commentRepository.findAll();
        for (Comments c : existing) {
            if ("Comment for book 1 by user 1".equalsIgnoreCase(c.getContent())) {
                c.setContent("The multi-leader replication conflict resolution section in Chapter 5 provides concrete practical solutions.");
                commentRepository.save(c);
            }
        }

        if (commentRepository.count() <= 1 && !books.isEmpty()) {
            commentRepository.save(Comments.builder()
                    .bookId(books.get(0).getBookId())
                    .user(user)
                    .content("The multi-leader replication conflict resolution section in Chapter 5 provides concrete practical solutions.")
                    .build());
            if (books.size() > 1) {
                commentRepository.save(Comments.builder()
                        .bookId(books.get(1).getBookId())
                        .user(user)
                        .content("The Clean Code principles on function arguments and command-query separation dramatically improved our team's pull request velocity.")
                        .build());
            }
            LOGGER.info("Seeded scholarly comments.");
        }
    }

    private void seedWishlist(WishlistRepository wishlistRepository, List<Book> books, User user) {
        if (books.size() > 2 && user != null) {
            Book bookToWish = books.get(2);
            boolean exists = wishlistRepository.findAll().stream()
                    .anyMatch(w -> w.getBook() != null && w.getBook().getBookId().equals(bookToWish.getBookId()) && w.getUser() != null && w.getUser().getUserId().equals(user.getUserId()));
            if (!exists) {
                wishlistRepository.save(Wishlist.builder()
                        .book(bookToWish)
                        .user(user)
                        .build());
                LOGGER.info("Seeded wishlist entry for {}", bookToWish.getTitle());
            }
        }
    }

    private void seedBadges(BadgeRepository badgeRepository, UserBadgeRepository userBadgeRepository, User user) {
        record BadgeSeed(String name, String desc, BadgeRequirementType type, int val, long points, String icon) {}

        List<BadgeSeed> badgeSeeds = List.of(
            new BadgeSeed("First Milestone Contributor", "Uploaded your very first academic paper or textbook to the digital library.", BadgeRequirementType.BOOK_UPLOAD, 1, 100L, "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=200&q=80"),
            new BadgeSeed("Archival Master", "Contributed 5 peer-verified resource documents to the central catalog.", BadgeRequirementType.BOOK_UPLOAD, 5, 350L, "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80"),
            new BadgeSeed("Dedicated Reader", "Maintained uninterrupted daily reading sessions for seven consecutive days.", BadgeRequirementType.READING_STREAK, 7, 250L, "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=200&q=80"),
            new BadgeSeed("Scholar Laureate", "Sustained continuous research engagement across fourteen calendar days.", BadgeRequirementType.READING_STREAK, 14, 600L, "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80"),
            new BadgeSeed("Critical Reviewer", "Provided constructive peer evaluations and ratings on 5 academic publications.", BadgeRequirementType.RATING, 5, 200L, "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=200&q=80"),
            new BadgeSeed("Knowledge Curator", "Downloaded and analyzed over 10 educational monographs and lecture decks.", BadgeRequirementType.DOWNLOAD, 10, 300L, "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80")
        );

        List<Badges> existingBadges = badgeRepository.findAll();
        // Upgrade legacy "First Login" badge if present
        for (Badges b : existingBadges) {
            if ("First Login".equalsIgnoreCase(b.getName())) {
                b.setName("First Milestone Contributor");
                b.setDescription("Uploaded your very first academic paper or textbook to the digital library.");
                b.setIconUrl("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=200&q=80");
                b.setRequirementType(BadgeRequirementType.BOOK_UPLOAD);
                badgeRepository.save(b);
            }
        }

        for (BadgeSeed bs : badgeSeeds) {
            boolean found = badgeRepository.findAll().stream().anyMatch(b -> bs.name().equalsIgnoreCase(b.getName()));
            if (!found) {
                Badges created = badgeRepository.save(Badges.builder()
                        .name(bs.name())
                        .description(bs.desc())
                        .requirementType(bs.type())
                        .requirementValue(bs.val())
                        .points(bs.points())
                        .iconUrl(bs.icon())
                        .build());
                if (user != null && userBadgeRepository.findAll().isEmpty()) {
                    userBadgeRepository.save(UserBadges.builder()
                            .badge(created)
                            .user(user)
                            .build());
                }
            }
        }
        LOGGER.info("Seeded academic badges.");
    }

    private void seedCommunities(CommunityRepository communityRepository, CommunityMembersRepository communityMembersRepository, User user) {
        String[][] commData = {
            {"IEEE Distributed Systems & Cloud Architecture Forum", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80"},
            {"AAAI - Machine Learning & Foundation Models Circle", "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80"},
            {"ACM SIGACT - Algorithms & Computation Guild", "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80"},
            {"Cloud Native Computing & SRE Working Group", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80"},
            {"Quantum Information & Computing Working Group", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80"}
        };

        List<Communities> existing = communityRepository.findAll();
        // Upgrade legacy "Community 1"
        for (Communities c : existing) {
            if ("Community 1".equalsIgnoreCase(c.getName())) {
                c.setName("IEEE Distributed Systems & Cloud Architecture Forum");
                c.setProfileUrl("https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80");
                communityRepository.save(c);
            }
        }

        for (String[] cd : commData) {
            String name = cd[0];
            boolean found = communityRepository.findAll().stream().anyMatch(c -> name.equalsIgnoreCase(c.getName()));
            if (!found) {
                Communities saved = communityRepository.save(Communities.builder()
                        .name(name)
                        .profileUrl(cd[1])
                        .createdBy(user)
                        .build());
                if (user != null) {
                    communityMembersRepository.save(CommunityMembers.builder()
                            .communities(saved)
                            .user(user)
                            .role(CommunitymemberRole.OWNER)
                            .build());
                }
                LOGGER.info("Seeded community: {}", name);
            }
        }
    }
}

