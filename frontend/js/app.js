// Online Course Management System - Frontend App
// Modernized with vibrant UI, Toast Notifications, and robust API handling

(function () {
    const API_BASE = 'http://127.0.0.1:8000/api';
    const AUTH_TOKEN_KEY = 'olms_access_token';
    const REFRESH_TOKEN_KEY = 'olms_refresh_token';

    // --- Utility Functions ---
    const $ = sel => document.querySelector(sel);
    const $all = sel => Array.from(document.querySelectorAll(sel));

    // --- Token Management ---
    function setToken(access, refresh) {
        localStorage.setItem(AUTH_TOKEN_KEY, access);
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
    function getToken() { return localStorage.getItem(AUTH_TOKEN_KEY); }
    function clearAuth() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    // --- UI Components ---
    function showToast(msg, type = 'success', duration = 3000) {
        let container = document.getElementById('toastWrapper');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastWrapper';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast badge-${type === 'success' ? 'success' : 'primary'}`;

        // Icons based on type
        const icon = type === 'success'
            ? '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

        toast.innerHTML = `${icon} <span>${msg}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // --- API Wrapper ---
    async function fetchApi(url, opts = {}) {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...opts.headers
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const res = await fetch(url, { ...opts, headers });

            if (res.status === 401) {
                clearAuth();
                if (!location.pathname.includes('login.html') && !location.pathname.includes('register.html')) {
                    location.href = 'login.html';
                }
                throw new Error('Unauthorized');
            }

            const isJson = res.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await res.json() : await res.text();

            if (!res.ok) {
                let errMsg = `Error ${res.status}`;
                if (data) {
                    if (data.detail) errMsg = data.detail;
                    else if (data.error) errMsg = data.error;
                    else if (typeof data === 'object') {
                        const firstKey = Object.keys(data)[0];
                        if (Array.isArray(data[firstKey])) {
                            errMsg = `${firstKey}: ${data[firstKey][0]}`;
                        } else {
                            errMsg = JSON.stringify(data);
                        }
                    } else if (typeof data === 'string') {
                        errMsg = data.substring(0, 50);
                    }
                }
                throw new Error(errMsg);
            }
            return data;
        } catch (err) {
            if (err.message === 'Failed to fetch') {
                throw new Error('Network error. Is the Django API running?');
            }
            throw err;
        }
    }

    // --- Page: Login ---
    const loginForm = $('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = $('#email').value.trim();
            const password = $('#password').value;
            const loginBtn = $('#loginBtn');

            if (!email || !password) return showToast('Please fill all fields', 'error');

            // UI state
            const originalText = loginBtn.innerHTML;
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<div class="spinner"></div> Signing in...';

            try {
                const data = await fetchApi(`${API_BASE}/auth/login/`, {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                if (data.access && data.refresh) {
                    setToken(data.access, data.refresh);

                    if (data.user && data.user.role) {
                        localStorage.setItem('user_role', data.user.role);
                    } else {
                        try {
                            const profile = await fetchApi(`${API_BASE}/auth/profile/`);
                            localStorage.setItem('user_role', profile.role || 'STUDENT');
                        } catch (e) {
                            localStorage.setItem('user_role', 'STUDENT');
                        }
                    }

                    showToast('Welcome back!', 'success');
                    setTimeout(() => location.href = 'dashboard.html', 800);
                } else {
                    throw new Error('Invalid token response');
                }
            } catch (e) {
                showToast(e.message || 'Login failed', 'error');
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalText;
            }
        });
    }

    // --- Page: Register ---
    const registerForm = $('#registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = $('#regName').value.trim();
            const email = $('#regEmail').value.trim();
            const password = $('#regPassword').value;
            const regBtn = $('#registerBtn');

            if (!name || !email || !password) return showToast('Please fill all fields', 'error');

            const originalText = regBtn.innerHTML;
            regBtn.disabled = true;
            regBtn.innerHTML = '<div class="spinner"></div> Creating account...';

            const nameParts = name.trim().split(' ');
            const firstName = nameParts[0] || 'Student';
            const lastName = nameParts.slice(1).join(' ') || '-'; // Prevent blank last_name

            try {
                await fetchApi(`${API_BASE}/auth/register/`, {
                    method: 'POST',
                    body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password, role: 'STUDENT' })
                });

                showToast('Account created! Please log in.', 'success');
                setTimeout(() => location.href = 'login.html', 1500);
            } catch (e) {
                showToast(e.message || 'Registration failed', 'error');
                regBtn.disabled = false;
                regBtn.innerHTML = originalText;
            }
        });
    }

    // --- Page: Dashboard ---
    function showDashboardCourses() {
        const catalog = $('#courseCatalog');
        if (!catalog) return;

        catalog.innerHTML = '<div style="grid-column:1/-1;text-align:center"><div class="spinner" style="margin:0 auto;border-color:var(--primary);border-top-color:transparent;"></div></div>';

        fetchApi(`${API_BASE}/courses/`).then(data => {
            catalog.innerHTML = '';
            if (!data || data.length === 0) {
                catalog.innerHTML = '<p class="text-muted" style="grid-column:1/-1;text-align:center">No courses available at the moment.</p>';
                return;
            }

            const userRole = localStorage.getItem('user_role') || 'STUDENT';

            data.forEach((course, index) => {
                const card = document.createElement('div');
                card.className = 'glass glass-panel';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.cursor = 'pointer';

                const isLive = course.title.toLowerCase().includes('live');
                const titleBadge = isLive ? `<span style="background:var(--accent);color:#fff;padding:2px 6px;border-radius:4px;font-size:0.75rem;font-weight:bold;margin-left:8px;vertical-align:middle;">LIVE</span>` : '';

                const actionBtn = (userRole === 'ADMIN' || userRole === 'INSTRUCTOR')
                    ? `<button class="btn btn-outline btn-small w-full mt-4" onclick="alert('Manage Course feature coming soon for Instructors/Admins!')">Manage Course</button>`
                    : `<button class="btn btn-primary btn-small enroll-btn" data-id="${course.id}" data-title="${course.title}">Enroll Now</button>`;

                card.innerHTML = `
          <h3 class="mt-2 mb-2 text-gradient" style="font-size:1.25rem;">${course.title}${titleBadge}</h3>
          <p style="flex:1;">${course.description || 'No description available for this course.'}</p>
          <div class="flex items-center justify-between mt-4">
            <span class="badge badge-primary">${course.level || 'Beginner'}</span>
            ${actionBtn}
          </div>
        `;

                card.addEventListener('click', () => {
                    localStorage.setItem('course_id', course.id);
                    localStorage.setItem('course_title', course.title);
                    location.href = 'course.html';
                });

                const enrollBtn = card.querySelector('.enroll-btn');
                if (enrollBtn) {
                    enrollBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        enrollCourse(course.id, course.title);
                    });
                }

                catalog.appendChild(card);
            });
        }).catch(err => {
            catalog.innerHTML = '<p class="text-muted" style="color:var(--danger)">Failed to load courses.</p>';
            showToast('Could not load courses', 'error');
        });
    }

    function enrollCourse(cid, title) {
        if (!getToken()) {
            showToast('Please login to enroll', 'error');
            setTimeout(() => location.href = 'login.html', 1000);
            return;
        }

        fetchApi(`${API_BASE}/enrollments/`, {
            method: 'POST',
            body: JSON.stringify({ course: cid, status: 'enrolled' })
        }).then(() => {
            showToast(`Successfully enrolled in ${title}!`, 'success');
            loadStats(); // Update stats if on dashboard
        }).catch(e => showToast(e.message || 'Enrollment failed. You might already be enrolled.', 'error'));
    }

    function loadStats() {
        fetchApi(`${API_BASE}/dashboard/`).then(data => {
            if ($('#statCourses')) $('#statCourses').textContent = data.total_courses || 0;
            if ($('#statEnrollments')) $('#statEnrollments').textContent = data.total_enrollments || 0;
            if ($('#statReviews')) $('#statReviews').textContent = data.total_reviews || 0;
        }).catch(console.error);
    }

    function loadGlobalReviews() {
        const list = $('#globalReviewsList');
        if (!list) return;

        Promise.all([
            fetchApi(`${API_BASE}/reviews/`),
            fetchApi(`${API_BASE}/courses/`)
        ]).then(([reviews, courses]) => {
            list.innerHTML = '';
            if (!reviews || reviews.length === 0) {
                list.innerHTML = '<p class="text-muted" style="grid-column:1/-1;">No reviews have been posted yet.</p>';
                return;
            }

            // Shuffle and pick up to 4 random reviews
            const shuffled = reviews.sort(() => 0.5 - Math.random()).slice(0, 4);

            shuffled.forEach(r => {
                const course = courses.find(c => String(c.id) === String(r.course)) || { title: 'Unknown Course' };
                const stars = '⭐'.repeat(r.rating || 5);
                const card = document.createElement('div');
                card.className = 'glass glass-panel';
                card.innerHTML = `
                    <div class="flex items-center justify-between mb-2">
                        <strong style="color:var(--text-main); font-size: 0.95rem;">${course.title}</strong>
                        <span style="font-size: 0.8rem;">${stars}</span>
                    </div>
                    <p class="text-muted mb-2" style="font-size:0.85rem; font-style:italic">"${r.comment || 'No written feedback'}"</p>
                    <div class="text-right"><small style="color:var(--primary)">- Student #${r.student}</small></div>
                `;
                list.appendChild(card);
            });
        }).catch(e => {
            list.innerHTML = '<p class="text-danger">Failed to load platform reviews.</p>';
        });
    }

    // --- Page: My Courses ---
    function loadMyCourses(filter = '') {
        const list = $('#myCoursesList');
        if (!list) return;

        list.innerHTML = '<div style="grid-column:1/-1;text-align:center"><div class="spinner" style="margin:0 auto;border-color:var(--primary);border-top-color:transparent;"></div></div>';

        Promise.all([
            fetchApi(`${API_BASE}/enrollments/`),
            fetchApi(`${API_BASE}/courses/`)
        ]).then(([enrollments, courses]) => {
            list.innerHTML = '';
            const filtered = filter ? enrollments.filter(e => e.status === filter) : enrollments;

            if (filtered.length === 0) {
                list.innerHTML = `
          <div class="glass glass-panel text-center" style="grid-column:1/-1;padding:60px 24px;">
            <div style="font-size:3rem;margin-bottom:16px;">📚</div>
            <h3>No courses found</h3>
            <p>You haven't enrolled in any courses yet or none match this filter.</p>
            <a href="dashboard.html" class="btn btn-primary mt-4">Browse Courses</a>
          </div>`;
                return;
            }

            filtered.forEach((e, index) => {
                const c = courses.find(course => String(course.id) === String(e.course)) || { title: 'Unknown Course' };
                const card = document.createElement('div');
                card.className = 'glass glass-panel';

                let col = e.status === 'completed' ? 'var(--success)' : 'var(--primary)';

                card.innerHTML = `
          <h3 class="mb-2" style="font-size:1.1rem">${c.title}</h3>
          <p class="text-muted" style="font-size:0.9rem">${c.description ? c.description.substring(0, 80) + '...' : ''}</p>
          <div class="mt-4 flex items-center justify-between borders-t" style="border-top:1px solid var(--border);padding-top:16px">
            <span style="color:${col};font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;font-weight:600">${e.status}</span>
            <button class="btn btn-outline btn-small continue-btn" data-id="${e.course}">Continue</button>
          </div>
        `;

                card.querySelector('.continue-btn').addEventListener('click', () => {
                    localStorage.setItem('course_id', e.course);
                    localStorage.setItem('course_title', c.title);
                    location.href = 'course.html';
                });

                list.appendChild(card);
            });
        }).catch(e => {
            list.innerHTML = '<p class="text-danger">Failed to load enrollments</p>';
        });
    }

    // --- Page: Course Detail ---
    function loadCourseContent() {
        const cid = localStorage.getItem('course_id');
        const title = localStorage.getItem('course_title');
        if (!cid) return;

        if ($('#courseTitle')) $('#courseTitle').textContent = title || 'Course Details';

        const modulesList = $('#courseModules');
        const lecturesView = $('#lecturesArea');
        if (!modulesList || !lecturesView) return;

        fetchApi(`${API_BASE}/modules/`).then(data => {
            const mods = data.filter(m => String(m.course) === String(cid));
            const viewReviewsBtn = $('#viewCourseReviewsBtn');

            if (mods.length === 0) {
                modulesList.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted)">No modules yet.</div>';
                lecturesView.innerHTML = '<div class="glass glass-panel text-center"><h3>Content Coming Soon</h3></div>';
            } else {
                modulesList.innerHTML = '';
                mods.forEach((m, i) => {
                    const btn = document.createElement('button');
                    btn.className = `btn w-full mb-2 ${i === 0 ? 'btn-primary' : 'glass'}`;
                    btn.style.justifyContent = 'flex-start';
                    btn.innerHTML = `<span style="opacity:0.6;margin-right:8px">${i + 1}.</span> ${m.title}`;

                    btn.addEventListener('click', () => {
                        $all('#courseModules button').forEach(b => {
                            b.classList.remove('btn-primary');
                            b.classList.add('glass');
                        });
                        btn.classList.remove('glass');
                        btn.classList.add('btn-primary');

                        if (viewReviewsBtn) {
                            viewReviewsBtn.classList.remove('btn-primary');
                            viewReviewsBtn.classList.add('glass');
                        }
                        loadLectures(m.id, m.title);
                    });
                    modulesList.appendChild(btn);
                });

                // Load first module default
                if (mods.length > 0) loadLectures(mods[0].id, mods[0].title);
            }

            // Sync the separate reviews button
            if (viewReviewsBtn) {
                viewReviewsBtn.addEventListener('click', () => {
                    $all('#courseModules button').forEach(b => {
                        b.classList.remove('btn-primary');
                        b.classList.add('glass');
                    });
                    viewReviewsBtn.classList.remove('glass');
                    viewReviewsBtn.classList.add('btn-primary');
                    loadReviews(cid);
                });
            }
        });

        function loadLectures(moduleId, moduleTitle) {
            fetchApi(`${API_BASE}/lectures/`).then(d => {
                const lecs = d.filter(l => String(l.module) === String(moduleId));

                lecturesView.innerHTML = `<h2 class="mb-4 text-gradient">${moduleTitle}</h2>`;

                if (lecs.length === 0) {
                    lecturesView.innerHTML += '<div class="glass glass-panel"><p class="text-center mb-0">No lectures in this module.</p></div>';
                    return;
                }

                lecs.forEach(l => {
                    const lcard = document.createElement('div');
                    lcard.className = 'glass glass-panel mb-4';
                    lcard.innerHTML = `
            <h3 style="color:#fff;margin-bottom:12px;">▶ ${l.title}</h3>
            <div style="background:rgba(0,0,0,0.2);padding:24px;border-radius:8px;line-height:1.7;">
              ${l.content || 'Video/Document content goes here...'}
            </div>
            <div class="mt-4 flex justify-between items-center">
                <span class="text-muted" style="font-size:0.85rem">Resource ID: ${l.id}</span>
                <button class="btn btn-outline btn-small">Mark Completed</button>
            </div>
          `;
                    lecturesView.appendChild(lcard);
                });
            });
        }

        function loadReviews(courseId) {
            lecturesView.innerHTML = `<div class="flex items-center justify-between mb-4"><h2 class="text-gradient">Student Reviews</h2> <button id="addReviewBtn" class="btn btn-outline btn-small">Write Review</button></div>`;

            fetchApi(`${API_BASE}/reviews/`).then(d => {
                const reviews = d.filter(r => String(r.course) === String(courseId));

                let html = '';
                if (reviews.length === 0) {
                    html = '<div class="glass glass-panel text-center"><p class="text-muted">No reviews yet for this course.</p></div>';
                } else {
                    reviews.forEach(r => {
                        const stars = '⭐'.repeat(r.rating || 5);
                        html += `
                     <div class="glass glass-panel mb-4" style="padding:16px 24px;">
                       <div class="flex items-center justify-between mb-2">
                          <strong style="color:var(--text-main)">Student #${r.student}</strong>
                          <span>${stars}</span>
                       </div>
                       <p class="text-muted mb-0">${r.comment || 'No written feedback provided.'}</p>
                     </div>
                   `;
                    });
                }
                lecturesView.innerHTML += `<div id="reviewsList">${html}</div>`;

                // Handle Add Review
                $('#addReviewBtn').addEventListener('click', () => {
                    const formHtml = `
                   <div class="glass glass-panel mt-4 mb-4" id="reviewFormArea" style="border: 1px solid var(--primary)">
                     <h3 class="mb-2">Submit Feedback</h3>
                     <div class="form-group">
                       <label class="form-label">Rating (1-5)</label>
                       <input type="number" id="reviewRating" min="1" max="5" value="5" class="form-control" style="width:100px">
                     </div>
                     <div class="form-group mb-4">
                       <label class="form-label">Comment</label>
                       <textarea id="reviewComment" class="form-control" rows="3" placeholder="What did you think of the course?"></textarea>
                     </div>
                     <button id="submitReviewFinal" class="btn btn-primary">Submit Review</button>
                   </div>
                 `;
                    $('#addReviewBtn').outerHTML = formHtml;

                    $('#submitReviewFinal').addEventListener('click', async () => {
                        const rating = $('#reviewRating').value;
                        const comment = $('#reviewComment').value;

                        let studentId = 1;
                        const t = getToken();
                        if (t) {
                            try {
                                const payload = JSON.parse(atob(t.split('.')[1]));
                                studentId = payload.user_id;
                            } catch (e) { }
                        }

                        try {
                            await fetchApi(`${API_BASE}/reviews/`, {
                                method: 'POST',
                                body: JSON.stringify({ course: courseId, student: studentId, rating, comment })
                            });
                            showToast('Review submitted!', 'success');
                            loadReviews(courseId); // Reload UI
                        } catch (err) {
                            showToast('Failed to submit review', 'error');
                        }
                    });
                });

            }).catch(e => {
                lecturesView.innerHTML += '<p class="text-danger">Failed to load reviews.</p>';
            });
        }
    }

    // --- Page: Profile ---
    function loadProfile() {
        if (!location.pathname.includes('profile.html')) return;

        fetchApi(`${API_BASE}/auth/profile/`).then(u => {
            if ($('#profEmail')) $('#profEmail').value = u.email || '';
            if ($('#profName')) $('#profName').value = u.full_name || '';

            const savedRole = localStorage.getItem('user_role') || 'STUDENT';
            if ($('#profRole')) $('#profRole').textContent = savedRole;

            if ($('#profJoinDate')) {
                const token = getToken();
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        // Set a generic date if the JWT doesn't have it, or current date as fallback mock.
                        $('#profJoinDate').textContent = new Date().toLocaleDateString();
                    } catch (e) { }
                }
            }
        }).catch(e => showToast('Could not load profile data', 'error'));
    }

    if ($('#updateProfileBtn')) {
        $('#updateProfileBtn').addEventListener('click', async () => {
            const name = $('#profName').value;
            const btn = $('#updateProfileBtn');
            const origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<div class="spinner"></div> Saving...';

            try {
                await fetchApi(`${API_BASE}/auth/profile/`, {
                    method: 'PUT',
                    body: JSON.stringify({ full_name: name })
                });
                showToast('Profile updated successfully!', 'success');
            } catch (e) {
                showToast('Update failed', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = origText;
            }
        });
    }

    // --- Global Event Listeners ---
    $all('.logout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            clearAuth();
            showToast('Logged out successfully');
            setTimeout(() => location.href = 'login.html', 800);
        });
    });

    // Filter buttons on My Courses
    $all('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            $all('.filter-btn').forEach(b => b.classList.remove('btn-primary'));
            $all('.filter-btn').forEach(b => b.classList.add('glass'));
            e.target.classList.remove('glass');
            e.target.classList.add('btn-primary');

            const st = e.target.dataset.filter;
            loadMyCourses(st);
        });
    });

    // --- Initialization ---
    document.addEventListener('DOMContentLoaded', () => {
        const path = location.pathname;
        const userRole = localStorage.getItem('user_role') || 'STUDENT';
        const navLinks = document.querySelector('.nav-links');

        if (navLinks && getToken()) {
            let linksHtml = `
                <li class="nav-item ${path.includes('dashboard.html') ? 'active' : ''}"><a href="dashboard.html">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" w="18" h="18" rx="2" ry="2"></rect>
                    </svg> Dashboard</a>
                </li>
            `;

            if (userRole === 'STUDENT') {
                linksHtml += `
                    <li class="nav-item ${path.includes('my-courses.html') ? 'active' : ''}"><a href="my-courses.html">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg> My Courses</a>
                    </li>
                `;
            } else {
                linksHtml += `
                    <li class="nav-item" onclick="alert('Admin Panel coming soon!')"><a href="#">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg> Manage Platform</a>
                    </li>
                `;
            }

            linksHtml += `
                <li class="nav-item ${path.includes('profile.html') ? 'active' : ''}"><a href="profile.html">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg> Profile Settings</a>
                </li>
            `;
            navLinks.innerHTML = linksHtml;
        }

        if (path.includes('dashboard.html')) {
            showDashboardCourses();
            loadStats();
            loadGlobalReviews();
        }
        else if (path.includes('my-courses.html')) {
            loadMyCourses();
        }
        else if (path.includes('course.html')) {
            loadCourseContent();
        }
        else if (path.includes('profile.html')) {
            loadProfile();
        }

        // Auth check protection for secure pages
        if (!path.includes('login.html') && !path.includes('register.html') && !getToken()) {
            location.href = 'login.html';
        }
    });

})();
