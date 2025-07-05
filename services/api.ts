
import { sampleArtisans, sampleJobRequests, sampleCustomers } from '../constants';
import { Artisan, JobRequest, JobStatus, ServiceCategory, Bid, User, UserRole, Customer, Review, ChatMessage, DisputeInfo } from '../types';

// Let's make our mock data mutable for the simulation
let mockJobRequests: JobRequest[] = JSON.parse(JSON.stringify(sampleJobRequests));

const apiDelay = 500; // ms

// --- Auth API ---

export const login = (email: string, password: string): Promise<User | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = [...sampleCustomers, ...sampleArtisans].find(
                u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );
            if (user) {
                // In a real app, never send the password back to the client
                const { password: _, ...userWithoutPassword } = user;
                resolve(userWithoutPassword as User);
            } else {
                resolve(null);
            }
        }, apiDelay);
    });
};

export const signup = (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole, 
    specialization?: ServiceCategory
): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const existingUser = [...sampleCustomers, ...sampleArtisans].find(u => u.email.toLowerCase() === email.toLowerCase());
            if (existingUser) {
                return reject(new Error("User with this email already exists."));
            }
            
            const commonData = {
                id: `${role.toLowerCase()}${Date.now()}`,
                name,
                email,
                password,
                phone: `06${Math.floor(10000000 + Math.random() * 90000000)}`, // Generate random phone
                avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
                role,
            };

            let newUser: Customer | Artisan;
            if (role === UserRole.Customer) {
                newUser = { ...commonData, role: UserRole.Customer };
                sampleCustomers.push(newUser);
            } else {
                if (!specialization) {
                    return reject(new Error("Specialization is required for artisans."));
                }
                const newArtisan: Artisan = { 
                    ...commonData, 
                    role: UserRole.Artisan,
                    specialization: specialization,
                    rating: 0,
                    jobsCompleted: 0,
                    isVerified: false,
                    portfolio: [],
                    location: 'Morocco', // Default location for new artisans
                    reviews: [],
                    totalEarnings: 0,
                    acceptanceRate: 0,
                };
                sampleArtisans.push(newArtisan);
                newUser = newArtisan;
            }
            
            const { password: _p, ...userWithoutPassword } = newUser;
            resolve(userWithoutPassword as User);
        }, apiDelay);
    });
};


// --- Customer facing API ---

export const getJobRequestsForCustomer = (customerId: string): Promise<JobRequest[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const jobs = mockJobRequests.filter(job => job.customerId === customerId);
      resolve(jobs.sort((a,b) => b.createdAt - a.createdAt));
    }, apiDelay);
  });
};

export const addJobRequest = (customerId: string, jobData: Omit<JobRequest, 'id' | 'customerId' | 'createdAt' | 'status' | 'bids' | 'chatHistory' | 'paymentStatus' | 'escrowAmount'>): Promise<JobRequest> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newJob: JobRequest = {
                ...jobData,
                id: `job${Date.now()}`,
                customerId: customerId,
                createdAt: Date.now(),
                status: JobStatus.Open,
                bids: [],
                chatHistory: [],
                paymentStatus: 'unpaid',
                escrowAmount: 0,
            };
            mockJobRequests.unshift(newJob);
            resolve(newJob);
        }, apiDelay);
    });
};

export const getArtisansByIds = (ids: string[]): Promise<Artisan[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const artisans = sampleArtisans.filter(a => ids.includes(a.id));
            resolve(artisans);
        }, apiDelay);
    });
};

export const acceptBid = (jobRequestId: string, bidId: string): Promise<JobRequest> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const jobIndex = mockJobRequests.findIndex(j => j.id === jobRequestId);
            if (jobIndex === -1) return reject(new Error("Job not found"));

            const job = mockJobRequests[jobIndex];
            if (job.status !== JobStatus.Open) return reject(new Error("Job is not open for bidding."));
            
            const bid = job.bids.find(b => b.id === bidId);
            if (!bid) return reject(new Error("Bid not found"));

            job.status = JobStatus.AwaitingPayment;
            job.acceptedArtisanId = bid.artisanId;
            job.escrowAmount = bid.amount;
            
            mockJobRequests[jobIndex] = job;
            resolve(JSON.parse(JSON.stringify(job)));
        }, apiDelay);
    });
};

export const processPayment = (jobRequestId: string): Promise<JobRequest> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const jobIndex = mockJobRequests.findIndex(j => j.id === jobRequestId);
            if (jobIndex === -1) return reject(new Error("Job not found"));
            
            const job = mockJobRequests[jobIndex];
            if(job.status !== JobStatus.AwaitingPayment) return reject(new Error("Job is not awaiting payment."));

            job.status = JobStatus.InProgress;
            job.paymentStatus = 'paid';
            
            mockJobRequests[jobIndex] = job;
            resolve(job);
        }, apiDelay * 1.5); // Simulate payment gateway delay
    });
};

export const releasePayment = (jobRequestId: string): Promise<JobRequest> => {
    // This is an internal function for our simulation
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const jobIndex = mockJobRequests.findIndex(j => j.id === jobRequestId);
            if (jobIndex === -1) return reject(new Error("Job not found"));

            const job = mockJobRequests[jobIndex];
            if(job.paymentStatus !== 'paid') return reject(new Error("Payment has not been secured for this job."));

            job.paymentStatus = 'released';

            // Find artisan and update earnings
            if (job.acceptedArtisanId && job.escrowAmount) {
                const artisanIndex = sampleArtisans.findIndex(a => a.id === job.acceptedArtisanId);
                if (artisanIndex !== -1) {
                    sampleArtisans[artisanIndex].totalEarnings += job.escrowAmount;
                }
            }
            
            console.log(`Payment of ${job.escrowAmount} MAD released for job ${job.id}.`);
            
            mockJobRequests[jobIndex] = job;
            resolve(job);
        }, apiDelay);
    });
}


export const completeJob = (jobRequestId: string): Promise<JobRequest> => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const jobIndex = mockJobRequests.findIndex(j => j.id === jobRequestId);
                if (jobIndex === -1) throw new Error("Job not found");

                const job = mockJobRequests[jobIndex];
                if (job.status !== JobStatus.InProgress) throw new Error("Job is not in progress");

                // Increment jobsCompleted stat now that the job is done.
                if (job.acceptedArtisanId) {
                    const artisanIndex = sampleArtisans.findIndex(a => a.id === job.acceptedArtisanId);
                    if (artisanIndex !== -1) {
                        sampleArtisans[artisanIndex].jobsCompleted += 1;
                    }
                }

                // Update job status
                job.status = JobStatus.Completed;

                // Release payment now that the job is complete
                await releasePayment(jobRequestId);

                // The job object in the array has been modified by both this function and releasePayment
                resolve(JSON.parse(JSON.stringify(mockJobRequests[jobIndex])));
            } catch (error) {
                reject(error);
            }
        }, apiDelay);
    });
};

export const addReview = (
    artisanId: string,
    customerId: string,
    jobId: string,
    rating: number,
    comment: string
): Promise<Review> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const artisanIndex = sampleArtisans.findIndex(a => a.id === artisanId);
            if (artisanIndex === -1) return reject(new Error("Artisan not found"));
            
            const customer = sampleCustomers.find(c => c.id === customerId);
            if (!customer) return reject(new Error("Customer not found"));

            const jobIndex = mockJobRequests.findIndex(j => j.id === jobId);
            if (jobIndex === -1) return reject(new Error("Job not found"));
            
            const job = mockJobRequests[jobIndex];
            if(job.status !== JobStatus.Completed) {
                return reject(new Error("You can only review a job that has been completed."));
            }

            if(job.isReviewed) return reject(new Error("Review already submitted for this job."));

            const newReview: Review = {
                id: `rev${Date.now()}`,
                customerId,
                customerName: customer.name,
                avatarUrl: customer.avatarUrl,
                rating,
                comment,
                timestamp: Date.now(),
            };

            const artisan = sampleArtisans[artisanIndex];
            
            // Add review
            artisan.reviews.unshift(newReview);
            
            // Recalculate average rating
            const totalRating = artisan.reviews.reduce((sum, r) => sum + r.rating, 0);
            artisan.rating = parseFloat((totalRating / artisan.reviews.length).toFixed(1));

            // Mark job as reviewed
            job.isReviewed = true;

            resolve(newReview);
        }, apiDelay);
    });
};

export const updateCustomerProfile = (customerId: string, name: string, phone: string, password?: string): Promise<Customer> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const customerIndex = sampleCustomers.findIndex(c => c.id === customerId);
            if (customerIndex === -1) {
                return reject(new Error("Customer not found."));
            }

            const customer = sampleCustomers[customerIndex];
            customer.name = name;
            customer.phone = phone;
            if (password) {
                customer.password = password;
            }

            sampleCustomers[customerIndex] = customer;
            
            const { password: _p, ...updatedCustomer } = customer;
            resolve(updatedCustomer as Customer);
        }, apiDelay);
    });
};

export const raiseDispute = (jobId: string, reason: string): Promise<JobRequest> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const jobIndex = mockJobRequests.findIndex(j => j.id === jobId);
            if (jobIndex === -1) return reject(new Error("Job not found."));

            const job = mockJobRequests[jobIndex];
            if (job.status !== JobStatus.Completed) return reject(new Error("You can only raise a dispute on a completed job."));
            if (job.dispute) return reject(new Error("A dispute has already been raised for this job."));

            const newDispute: DisputeInfo = {
                reason,
                raisedAt: Date.now(),
                status: 'open',
            };
            
            job.status = JobStatus.Disputed;
            job.dispute = newDispute;

            mockJobRequests[jobIndex] = job;
            resolve(JSON.parse(JSON.stringify(job)));
        }, apiDelay);
    });
};


// --- Artisan facing API ---

export const getAllJobRequests = (): Promise<JobRequest[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(mockJobRequests)));
        }, apiDelay);
    });
};

export const placeBid = (jobRequestId: string, artisanId: string, amount: number): Promise<JobRequest> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const jobIndex = mockJobRequests.findIndex(j => j.id === jobRequestId);
            if (jobIndex === -1) {
                return reject(new Error("Job not found"));
            }

            const newBid: Bid = {
                id: `bid${Date.now()}`,
                jobRequestId,
                artisanId,
                amount,
                timestamp: Date.now(),
            };
            
            mockJobRequests[jobIndex].bids.push(newBid);
            resolve(JSON.parse(JSON.stringify(mockJobRequests[jobIndex])));
        }, apiDelay);
    });
};

export const updateArtisanProfile = (
    artisanId: string, 
    updates: { name?: string; specialization?: ServiceCategory; location?: string; portfolio?: string[], phone?: string }
): Promise<Artisan> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const artisanIndex = sampleArtisans.findIndex(a => a.id === artisanId);
            if (artisanIndex === -1) {
                return reject(new Error("Artisan not found."));
            }

            const artisan = sampleArtisans[artisanIndex];

            // Update fields if they are provided
            if (updates.name) artisan.name = updates.name;
            if (updates.phone) artisan.phone = updates.phone;
            if (updates.specialization) artisan.specialization = updates.specialization;
            if (updates.location) artisan.location = updates.location;
            if (updates.portfolio) artisan.portfolio = updates.portfolio;

            sampleArtisans[artisanIndex] = artisan;
            
            const { password: _p, ...updatedArtisan } = artisan;
            resolve(updatedArtisan as Artisan);
        }, apiDelay);
    });
};

// --- Shared API ---

export const getJobById = (jobId: string): Promise<JobRequest | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const job = mockJobRequests.find(j => j.id === jobId);
            resolve(job ? JSON.parse(JSON.stringify(job)) : null);
        }, 100); // quick fetch
    });
};

export const addChatMessageToJob = (jobId: string, message: ChatMessage): Promise<JobRequest> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const jobIndex = mockJobRequests.findIndex(j => j.id === jobId);
            if (jobIndex === -1) {
                return reject(new Error("Job not found"));
            }
            if (!mockJobRequests[jobIndex].chatHistory) {
                mockJobRequests[jobIndex].chatHistory = [];
            }
            mockJobRequests[jobIndex].chatHistory!.push(message);
            resolve(mockJobRequests[jobIndex]);
        }, 50);
    });
};

export const getCustomersByIds = (ids: string[]): Promise<Customer[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const customers = sampleCustomers.filter(c => ids.includes(c.id));
            resolve(customers);
        }, apiDelay);
    });
};


// --- Notification System Support ---
export const getAllArtisans = (): Promise<Artisan[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(sampleArtisans)));
        }, apiDelay);
    });
};

export const getAllCustomers = (): Promise<Customer[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(sampleCustomers)));
        }, apiDelay);
    });
};
