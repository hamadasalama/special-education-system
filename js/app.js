/* ==========================================================================
   نظام الزيارات الصفية ومؤشرات الأداء | مدارس التطوير العلمي الأهلية
   JavaScript Core Engine (app.js) - المحدث بإدارة البنود وتفاصيل الطباعة
   ========================================================================== */

const App = {
    currentUser: null,

    // البيانات الافتراضية الأولية للنظام
    defaultData: {
        departments: [
            { id: 'dept_spe', name: 'قسم التربية الخاصة' },
            { id: 'dept_ar', name: 'قسم اللغة العربية' },
            { id: 'dept_math', name: 'قسم الرياضيات والعلوم' }
        ],
        rubrics: {
            'dept_spe': [
                'مراعاة الفروق الفردية وإعداد الخطة التربوية الفردية',
                'استخدام الوسائل التوضيحية والتعزيز الإيجابي للطلاب',
                'مستوى تحقيق الأهداف السلوكية للدرس'
            ],
            'dept_ar': [
                'تمكن المعلم من المادة العلمية ومواضيع اللغة',
                'استخدام استراتيجيات القراءة والكتابة والتحليل',
                'إدارة الصف والتفاعل مع الطلاب'
            ],
            'dept_math': [
                'استخدام التفكير الناقد والحل العلمي للمشكلات',
                'التطبيق العملي والأنشطة والتجارب',
                'ربط الدرس بالبيئة والتكنولوجيا'
            ]
        },
        users: [
            { id: 'u_admin', username: 'admin', password: 'admin123', name: 'د. منتصر العيادي (رئيس القسم)', role: 'ADMIN', departmentId: 'dept_spe', stage: 'الإدارة' },
            { id: 'u_t1', username: 't_spe', password: '123', name: 'معلم التربية الخاصة', role: 'TEACHER', departmentId: 'dept_spe', stage: 'الابتدائية' },
            { id: 'u_t2', username: 't_ar', password: '123', name: 'معلم اللغة العربية', role: 'TEACHER', departmentId: 'dept_ar', stage: 'المتوسطة' }
        ]
    },

    // 1. تهيئة النظام والتحقق من التخزين المحلي
    init: function() {
        if (!localStorage.getItem('sys_users')) {
            localStorage.setItem('sys_users', JSON.stringify(this.defaultData.users));
        }
        if (!localStorage.getItem('sys_depts')) {
            localStorage.setItem('sys_depts', JSON.stringify(this.defaultData.departments));
        }
        if (!localStorage.getItem('sys_rubrics')) {
            localStorage.setItem('sys_rubrics', JSON.stringify(this.defaultData.rubrics));
        }
        if (!localStorage.getItem('sys_visits')) {
            localStorage.setItem('sys_visits', JSON.stringify([]));
        }

        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        } else {
            this.navigateTo('login');
        }
    },

    // 2. إدارة الجلسة وتسجيل الدخول والخروج
    handleLogin: function(e) {
        if (e) e.preventDefault();
        const u = document.getElementById('login-username').value.trim();
        const p = document.getElementById('login-password').value.trim();

        const users = JSON.parse(localStorage.getItem('sys_users') || '[]');
        const found = users.find(x => x.username.toLowerCase() === u.toLowerCase() && x.password === p);

        if (found) {
            this.currentUser = found;
            localStorage.setItem('currentUser', JSON.stringify(found));
            this.showMainApp();
        } else {
            alert('اسم المستخدم أو كلمة المرور غير صحيحة!');
        }
    },

    logout: function() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        document.getElementById('app-header').classList.add('hidden');
        document.getElementById('sidebar').classList.add('hidden');
        this.navigateTo('login');
    },

    showMainApp: function() {
        document.getElementById('app-header').classList.remove('hidden');
        document.getElementById('sidebar').classList.remove('hidden');
        document.getElementById('user-display-name').innerText = this.currentUser.name;
        document.getElementById('user-display-role').innerText = this.currentUser.role === 'ADMIN' ? 'مدير النظام' : 'معلم';

        if (this.currentUser.role !== 'ADMIN') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        }

        this.navigateTo('dashboard');
    },

    // 3. التنقل بين الشاشات
    navigateTo: function(screenId) {
        document.querySelectorAll('.screen-view').forEach(s => s.classList.add('hidden'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        const target = document.getElementById(`screen-${screenId}`);
        if (target) target.classList.remove('hidden');

        const navItem = document.getElementById(`nav-${screenId}`);
        if (navItem) navItem.classList.add('active');

        switch (screenId) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'teachers':
                this.loadTeachers();
                break;
            case 'departments':
                this.loadDepartments();
                break;
            case 'visits-new':
                this.loadVisitForm();
                break;
            case 'visits':
                this.loadVisitsLog();
                break;
            case 'reports':
                this.loadArchiveReports();
                break;
        }
    },

    // 4. لوحة الإحصائيات العامة
    loadDashboard: function() {
        const users = JSON.parse(localStorage.getItem('sys_users') || '[]');
        const visits = JSON.parse(localStorage.getItem('sys_visits') || '[]');
        const teachers = users.filter(u => u.role === 'TEACHER');

        document.getElementById('stat-teachers-count').innerText = teachers.length;
        document.getElementById('stat-visits-count').innerText = visits.length;

        const avg = visits.length > 0 ? Math.round(visits.reduce((a, b) => a + b.percentage, 0) / visits.length) : 0;
        document.getElementById('stat-avg-score').innerText = avg + '%';
    },

    // 5. إدارة الأقسام وبنود التقييم الخاصة بكل قسم
    loadDepartments: function() {
        const depts = JSON.parse(localStorage.getItem('sys_depts') || '[]');
        const rubrics = JSON.parse(localStorage.getItem('sys_rubrics') || '{}');
        const users = JSON.parse(localStorage.getItem('sys_users') || '[]');
        const tbody = document.getElementById('departments-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        depts.forEach((d, i) => {
            const count = users.filter(u => u.departmentId === d.id).length;
            const items = rubrics[d.id] || [];
            
            let itemsHtml = items.map((item, idx) => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:6px 10px; margin-bottom:4px; border-radius:6px; border:1px solid #e2e8f0; font-size:12px;">
                    <span>• ${item}</span>
                    <div class="admin-only">
                        <button class="btn btn-sm btn-outline-primary" style="padding:2px 6px;" onclick="App.editRubricItem('${d.id}', ${idx})" title="تعديل البند"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger" style="padding:2px 6px;" onclick="App.deleteRubricItem('${d.id}', ${idx})" title="حذف البند"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `).join('');

            tbody.innerHTML += `
                <tr>
                    <td style="vertical-align:top;">${i + 1}</td>
                    <td style="vertical-align:top;">
                        <strong>${d.name}</strong><br>
                        <small style="color:#64748b;">${count} معلم مسجل</small>
                    </td>
                    <td>
                        <div style="margin-bottom:8px;" class="flex-between">
                            <span style="font-weight:700; font-size:12px; color:var(--primary);">بنود التقييم المعتمدة (${items.length}):</span>
                            <button class="btn btn-sm btn-outline-primary admin-only" onclick="App.addRubricItem('${d.id}')"><i class="fas fa-plus"></i> إضافة بند جديد</button>
                        </div>
                        ${itemsHtml || '<span style="color:#94a3b8; font-size:12px;">لا توجد بنود مضافة لهذا القسم.</span>'}
                    </td>
                </tr>
            `;
        });
    },

    // إضافة وتعديل وحذف بنود القسم
    addRubricItem: function(deptId) {
        const newItem = prompt('أدخل نص معيار / بند التقييم الجديد:');
        if (!newItem || !newItem.trim()) return;

        const rubrics = JSON.parse(localStorage.getItem('sys_rubrics') || '{}');
        if (!rubrics[deptId]) rubrics[deptId] = [];
        
        rubrics[deptId].push(newItem.trim());
        localStorage.setItem('sys_rubrics', JSON.stringify(rubrics));
        this.loadDepartments();
    },

    editRubricItem: function(deptId, itemIndex) {
        const rubrics = JSON.parse(localStorage.getItem('sys_rubrics') || '{}');
        const currentText = rubrics[deptId][itemIndex];

        const updatedText = prompt('تعديل بند التقييم:', currentText);
        if (updatedText === null || !updatedText.trim()) return;

        rubrics[deptId][itemIndex] = updatedText.trim();
        localStorage.setItem('sys_rubrics', JSON.stringify(rubrics));
        this.loadDepartments();
    },

    deleteRubricItem: function(deptId, itemIndex) {
        if (!confirm('هل أنت تأكد من حذف هذا البند من التقييم؟')) return;

        const rubrics = JSON.parse(localStorage.getItem('sys_rubrics') || '{}');
        rubrics[deptId].splice(itemIndex, 1);
        localStorage.setItem('sys_rubrics', JSON.stringify(rubrics));
        this.loadDepartments();
    },

    // 6. إدارة وتحديث المعلمين
    loadTeachers: function() {
        const users = JSON.parse(localStorage.getItem('sys_users') || '[]');
        const depts = JSON.parse(localStorage.getItem('sys_depts') || '[]');
        const teachers = users.filter(u => u.role === 'TEACHER');
        const grid = document.getElementById('teachers-card-grid');
        if (!grid) return;

        grid.innerHTML = '';
        teachers.forEach(t => {
            const dept = depts.find(d => d.id === t.departmentId);
            grid.innerHTML += `
                <div class="teacher-card">
                    <div class="teacher-card-header">
                        <div class="teacher-avatar"><i class="fas fa-user-tie"></i></div>
                        <div>
                            <h4 class="teacher-name">${t.name}</h4>
                            <span class="badge primary">${dept ? dept.name : 'عام'}</span>
                        </div>
                    </div>
                    <div class="teacher-card-body">
                        <p><strong>اسم المستخدم:</strong> <code style="color:#2563eb;">${t.username}</code></p>
                        <p><strong>كلمة المرور:</strong> <code>${t.password}</code></p>
                        <p><strong>المرحلة الدراسية:</strong> ${t.stage || 'الابتدائية'}</p>
                    </div>
                    <div class="teacher-card-footer flex-between">
                        <button class="btn btn-sm btn-outline-danger admin-only" onclick="App.deleteTeacher('${t.id}')"><i class="fas fa-trash"></i> حذف</button>
                    </div>
                </div>
            `;
        });
    },

    showTeacherModal: function() {
        const depts = JSON.parse(localStorage.getItem('sys_depts') || '[]');
        const select = document.getElementById('modal-teacher-dept');
        select.innerHTML = '';
        depts.forEach(d => select.innerHTML += `<option value="${d.id}">${d.name}</option>`);
        document.getElementById('teacher-modal').classList.remove('hidden');
    },

    closeTeacherModal: function() {
        document.getElementById('teacher-modal').classList.add('hidden');
        document.getElementById('teacher-form').reset();
    },

    saveTeacher: function(e) {
        if (e) e.preventDefault();
        const users = JSON.parse(localStorage.getItem('sys_users') || '[]');
        const newT = {
            id: 'u_' + Date.now(),
            name: document.getElementById('modal-teacher-name').value.trim(),
            username: document.getElementById('modal-teacher-user').value.trim(),
            password: document.getElementById('modal-teacher-pass').value.trim(),
            departmentId: document.getElementById('modal-teacher-dept').value,
            stage: document.getElementById('modal-teacher-stage').value.trim() || 'الابتدائية',
            role: 'TEACHER'
        };

        users.push(newT);
        localStorage.setItem('sys_users', JSON.stringify(users));
        this.closeTeacherModal();
        this.loadTeachers();
    },

    deleteTeacher: function(id) {
        if (!confirm('هل أنت تأكد من حذف حساب هذا المعلم؟')) return;
        let users = JSON.parse(localStorage.getItem('sys_users') || '[]');
        users = users.filter(u => u.id !== id);
        localStorage.setItem('sys_users', JSON.stringify(users));
        this.loadTeachers();
    },

    // 7. إجراء زيارة صفية وتوليد البنود الحالية للقسم
    loadVisitForm: function() {
        const users = JSON.parse(localStorage.getItem('sys_users') || '[]');
        const teachers = users.filter(u => u.role === 'TEACHER');
        const select = document.getElementById('eval-teacher-select');
        if (!select) return;

        select.innerHTML = '<option value="">-- اختر المعلم --</option>';
        teachers.forEach(t => select.innerHTML += `<option value="${t.id}">${t.name}</option>`);

        document.getElementById('eval-date').valueAsDate = new Date();
        document.getElementById('rubric-items-list').innerHTML = '';
        document.getElementById('eval-teacher-dept-display').value = '';
    },

    onTeacherSelected: function() {
        const teacherId = document.getElementById('eval-teacher-select').value;
        if (!teacherId) return;

        const users = JSON.parse(localStorage.getItem('sys_users') || '[]');
        const depts = JSON.parse(localStorage.getItem('sys_depts') || '[]');
        const rubrics = JSON.parse(localStorage.getItem('sys_rubrics') || '{}');

        const teacher = users.find(u => u.id === teacherId);
        const dept = depts.find(d => d.id === teacher.departmentId);

        document.getElementById('eval-teacher-dept-display').value = dept ? dept.name : 'غير محدد';

        const items = rubrics[teacher.departmentId] || [
            'الالتزام بالحضور والأداء المهني الصفّي',
            'تحقيق أهداف المادة والأنشطة الصفية',
            'استخدام أدوات التقييم المناسبة'
        ];

        const container = document.getElementById('rubric-items-list');
        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = '<p style="color:red; font-size:13px;">تنبيه: لا توجد بنود تقييم مضافة لهذا القسم حالياً. يرجى إضافتها من شاشة الأقسام.</p>';
            return;
        }

        items.forEach((item, idx) => {
            container.innerHTML += `
                <div class="form-group rubric-item-row" data-title="${item}" style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #cbd5e1; margin-bottom:10px;">
                    <label style="display:block; margin-bottom:6px;"><strong>بند #${idx + 1}:</strong> ${item}</label>
                    <select class="form-control rubric-score-input" required>
                        <option value="5">ممتاز (5/5)</option>
                        <option value="4">جيد جداً (4/5)</option>
                        <option value="3">جيد (3/5)</option>
                        <option value="2">مقبول (2/5)</option>
                    </select>
                </div>
            `;
        });
    },

    saveVisit: function(e) {
        if (e) e.preventDefault();
        const teacherId = document.getElementById('eval-teacher-select').value;
        if (!teacherId) {
            alert('يرجى اختيار معلم من القائمة أولاً');
            return;
        }

        const users = JSON.parse(localStorage.getItem('sys_users') || '[]');
        const depts = JSON.parse(localStorage.getItem('sys_depts') || '[]');
        const teacher = users.find(u => u.id === teacherId);
        const dept = depts.find(d => d.id === teacher.departmentId);

        const rows = document.querySelectorAll('.rubric-item-row');
        if (rows.length === 0) {
            alert('لا توجد بنود تقييم لتقييم هذا المعلم!');
            return;
        }

        const details = [];
        let got = 0;

        rows.forEach(row => {
            const title = row.getAttribute('data-title');
            const score = parseInt(row.querySelector('.rubric-score-input').value);
            got += score;
            details.push({
                title: title,
                score: score,
                maxScore: 5
            });
        });

        const max = details.length * 5;
        const pct = Math.round((got / max) * 100);

        const visit = {
            id: 'v_' + Date.now(),
            reportNumber: 'REP-' + Math.floor(1000 + Math.random() * 9000),
            teacherId: teacher.id,
            teacherName: teacher.name,
            departmentName: dept ? dept.name : 'عام',
            date: document.getElementById('eval-date').value,
            subject: document.getElementById('eval-subject').value,
            scoreGot: got,
            scoreMax: max,
            percentage: pct,
            details: details
        };

        const visits = JSON.parse(localStorage.getItem('sys_visits') || '[]');
        visits.push(visit);
        localStorage.setItem('sys_visits', JSON.stringify(visits));

        alert('تم اعتماد وحفظ تقرير الزيارة بنجاح!');
        this.navigateTo('reports');
    },

    // 8. سجل الزيارات والطباعة الرسمية
    loadVisitsLog: function() {
        const visits = JSON.parse(localStorage.getItem('sys_visits') || '[]');
        const tbody = document.getElementById('all-visits-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        visits.forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${v.reportNumber}</strong></td>
                    <td>${v.teacherName}</td>
                    <td>${v.departmentName}</td>
                    <td>${v.date}</td>
                    <td><strong style="color:#059669;">${v.percentage}%</strong></td>
                    <td><button class="btn btn-sm btn-outline-primary" onclick="App.viewReport('${v.id}')"><i class="fas fa-print"></i> معاينة وطباعة</button></td>
                </tr>
            `;
        });
    },

    loadArchiveReports: function() {
        const visits = JSON.parse(localStorage.getItem('sys_visits') || '[]');
        const tbody = document.getElementById('archive-reports-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        visits.forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${v.reportNumber}</strong></td>
                    <td>${v.teacherName}</td>
                    <td>${v.departmentName}</td>
                    <td>${v.subject}</td>
                    <td>${v.date}</td>
                    <td><strong style="color:#059669;">${v.percentage}%</strong></td>
                    <td><button class="btn btn-sm btn-primary" onclick="App.viewReport('${v.id}')"><i class="fas fa-print"></i> التقرير الرسمي</button></td>
                </tr>
            `;
        });
    },

    // طباعة وتوليد التقرير النهائي متضمناً أسماء البنود المخصصة
    viewReport: function(visitId) {
        const visits = JSON.parse(localStorage.getItem('sys_visits') || '[]');
        const v = visits.find(x => x.id === visitId);
        if (!v) return;

        document.getElementById('rep-doc-num').innerText = v.reportNumber;
        document.getElementById('rep-doc-date').innerText = v.date;
        document.getElementById('rep-header-dept-name').innerText = v.departmentName;
        document.getElementById('rep-teacher-name').innerText = v.teacherName;
        document.getElementById('rep-teacher-spec').innerText = v.departmentName;
        document.getElementById('rep-subject-topic').innerText = v.subject;
        document.getElementById('rep-final-score').innerText = `${v.percentage}% (${v.scoreGot} من ${v.scoreMax})`;
        document.getElementById('rep-sig-teacher').innerText = v.teacherName;

        const tbody = document.getElementById('rep-rubric-body');
        tbody.innerHTML = '';
        
        v.details.forEach((d, i) => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${d.title || ('معيار تقييمي رقم #' + (i + 1))}</strong></td>
                    <td style="text-align:center;"><strong>${d.score} / ${d.maxScore}</strong></td>
                    <td>مُستوفى بحسب الشواهد الملاحظة</td>
                </tr>
            `;
        });

        this.navigateTo('report-view');
    }
};
// كود لتحديث اسم المستخدم الموجود بجانب "مرحباً" في الهيدر فوراً
function updateHeaderGreetingName() {
    const targetName = 'د.منتصر العيادي';

    // 1. تحديث العنصر المرئي في الهيدر مباشرة
    const headerNameSpan = document.getElementById('user-display-name');
    if (headerNameSpan) {
        headerNameSpan.innerText = targetName;
    }

    // 2. تحديث الجلسة الحالية في localStorage لكي يثبت الاسم ولا يتغير عند التنقل
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser && currentUser.username) {
        currentUser.name = targetName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        if (typeof App !== 'undefined') {
            App.currentUser = currentUser;
        }
    }

    // 3. تحديثه أيضاً داخل قاعدة بيانات المستخدمين العامة (sys_users)
    let users = JSON.parse(localStorage.getItem('sys_users') || '[]');
    let updated = false;
    users = users.map(user => {
        if (user.role === 'ADMIN' || user.username.toLowerCase() === 'admin' || (currentUser && user.username === currentUser.username)) {
            user.name = targetName;
            updated = true;
        }
        return user;
    });
    if (updated) {
        localStorage.setItem('sys_users', JSON.stringify(users));
    }
}

// تنفيذ الكود فوراً
updateHeaderGreetingName();

// 9. تشغيل النظام عند التحميل
window.addEventListener('DOMContentLoaded', function() {
    App.init();
});
