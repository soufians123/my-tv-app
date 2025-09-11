import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AdminLayout from '../../components/admin/AdminLayout'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck,
  Mail,
  Calendar,
  Activity,
  Ban,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Plus,
  Download,
  Upload,
  Settings,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const UsersManagement = () => {
  const { user, loading, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [userModal, setUserModal] = useState({ isOpen: false, user: null, mode: 'view' })
  const [addUserModal, setAddUserModal] = useState(false)
  const [editUserModal, setEditUserModal] = useState({ isOpen: false, user: null })
  const [permissionsModal, setPermissionsModal] = useState({ isOpen: false, user: null })
  const [bulkActions, setBulkActions] = useState({ selectedUsers: [], showActions: false })
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  })

  useEffect(() => {
    // AdminLayout يتكفل بالتحقق من الصلاحيات
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter, roleFilter])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      // بيانات تجريبية للمستخدمين
      const mockUsers = [
        {
          id: 'admin-user-id',
          email: 'admin@zomiga.com',
          name: 'مدير النظام',
          role: 'admin',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-01-01T00:00:00Z',
          lastLogin: '2024-01-20T10:30:00Z',
          articlesCount: 25,
          gamesPlayed: 0,
          totalScore: 0
        },
        {
          id: 'user-1',
          email: 'ahmed.mohamed@example.com',
          name: 'أحمد محمد',
          role: 'user',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-01-15T08:00:00Z',
          lastLogin: '2024-01-20T09:15:00Z',
          articlesCount: 12,
          gamesPlayed: 45,
          totalScore: 15420
        },
        {
          id: 'user-2',
          email: 'fatima.ali@example.com',
          name: 'فاطمة علي',
          role: 'user',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-01-20T14:30:00Z',
          lastLogin: '2024-01-20T08:45:00Z',
          articlesCount: 8,
          gamesPlayed: 38,
          totalScore: 14890
        },
        {
          id: 'user-3',
          email: 'mohamed.hassan@example.com',
          name: 'محمد حسن',
          role: 'user',
          status: 'inactive',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-01-10T12:00:00Z',
          lastLogin: '2024-01-18T16:20:00Z',
          articlesCount: 5,
          gamesPlayed: 42,
          totalScore: 13750
        },
        {
          id: 'user-4',
          email: 'sara.ahmed@example.com',
          name: 'سارة أحمد',
          role: 'moderator',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-01-25T10:15:00Z',
          lastLogin: '2024-01-20T07:30:00Z',
          articlesCount: 18,
          gamesPlayed: 35,
          totalScore: 12980
        },
        {
          id: 'user-5',
          email: 'omar.salem@example.com',
          name: 'عمر سالم',
          role: 'user',
          status: 'banned',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-02-01T16:45:00Z',
          lastLogin: '2024-01-19T11:10:00Z',
          articlesCount: 2,
          gamesPlayed: 15,
          totalScore: 3450
        },
        {
          id: 'user-6',
          email: 'layla.hassan@example.com',
          name: 'ليلى حسن',
          role: 'user',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-01-28T09:20:00Z',
          lastLogin: '2024-01-20T14:25:00Z',
          articlesCount: 15,
          gamesPlayed: 52,
          totalScore: 16780
        },
        {
          id: 'user-7',
          email: 'khalid.omar@example.com',
          name: 'خالد عمر',
          role: 'user',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-02-05T11:45:00Z',
          lastLogin: '2024-01-20T16:10:00Z',
          articlesCount: 7,
          gamesPlayed: 29,
          totalScore: 11250
        },
        {
          id: 'user-8',
          email: 'nour.salem@example.com',
          name: 'نور سالم',
          role: 'moderator',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-01-12T15:30:00Z',
          lastLogin: '2024-01-20T12:40:00Z',
          articlesCount: 22,
          gamesPlayed: 41,
          totalScore: 14560
        },
        {
          id: 'user-9',
          email: 'youssef.ali@example.com',
          name: 'يوسف علي',
          role: 'user',
          status: 'inactive',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-01-08T13:15:00Z',
          lastLogin: '2024-01-17T10:20:00Z',
          articlesCount: 4,
          gamesPlayed: 23,
          totalScore: 8920
        },
        {
          id: 'user-10',
          email: 'maryam.ahmed@example.com',
          name: 'مريم أحمد',
          role: 'user',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-02-10T08:50:00Z',
          lastLogin: '2024-01-20T18:30:00Z',
          articlesCount: 9,
          gamesPlayed: 33,
          totalScore: 12340
        },
        {
          id: 'user-11',
          email: 'hassan.mohamed@example.com',
          name: 'حسن محمد',
          role: 'user',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-01-30T17:25:00Z',
          lastLogin: '2024-01-20T11:15:00Z',
          articlesCount: 6,
          gamesPlayed: 27,
          totalScore: 9870
        },
        {
          id: 'user-12',
          email: 'amina.hassan@example.com',
          name: 'أمينة حسن',
          role: 'user',
          status: 'banned',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-02-03T14:40:00Z',
          lastLogin: '2024-01-18T09:50:00Z',
          articlesCount: 1,
          gamesPlayed: 8,
          totalScore: 2150
        },
        {
          id: 'user-13',
          email: 'ali.omar@example.com',
          name: 'علي عمر',
          role: 'user',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-01-22T12:10:00Z',
          lastLogin: '2024-01-20T15:45:00Z',
          articlesCount: 11,
          gamesPlayed: 39,
          totalScore: 13680
        },
        {
          id: 'user-14',
          email: 'zahra.salem@example.com',
          name: 'زهراء سالم',
          role: 'user',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-02-08T10:35:00Z',
          lastLogin: '2024-01-20T13:20:00Z',
          articlesCount: 13,
          gamesPlayed: 46,
          totalScore: 15920
        },
        {
          id: 'user-15',
          email: 'ibrahim.ali@example.com',
          name: 'إبراهيم علي',
          role: 'moderator',
          status: 'active',
          avatar: '/api/placeholder/40/40',
          createdAt: '2024-01-18T16:20:00Z',
          lastLogin: '2024-01-20T17:10:00Z',
          articlesCount: 19,
          gamesPlayed: 31,
          totalScore: 12750
        }
      ]
      
      setUsers(mockUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('حدث خطأ في تحميل المستخدمين')
    } finally {
      setLoadingUsers(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // البحث بالاسم أو البريد الإلكتروني
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // تصفية حسب الحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    // تصفية حسب الدور
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleUserAction = async (userId, action) => {
    try {
      switch (action) {
        case 'activate':
          setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u))
          toast.success('تم تفعيل المستخدم بنجاح')
          break
        case 'deactivate':
          setUsers(users.map(u => u.id === userId ? { ...u, status: 'inactive' } : u))
          toast.success('تم إلغاء تفعيل المستخدم')
          break
        case 'ban':
          setUsers(users.map(u => u.id === userId ? { ...u, status: 'banned' } : u))
          toast.success('تم حظر المستخدم')
          break
        case 'unban':
          setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u))
          toast.success('تم إلغاء حظر المستخدم')
          break
        case 'make_admin':
          setUsers(users.map(u => u.id === userId ? { ...u, role: 'admin' } : u))
          toast.success('تم ترقية المستخدم إلى مدير')
          break
        case 'make_moderator':
          setUsers(users.map(u => u.id === userId ? { ...u, role: 'moderator' } : u))
          toast.success('تم ترقية المستخدم إلى مشرف')
          break
        case 'make_user':
          setUsers(users.map(u => u.id === userId ? { ...u, role: 'user' } : u))
          toast.success('تم تغيير دور المستخدم إلى مستخدم عادي')
          break
        case 'delete':
          if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            setUsers(users.filter(u => u.id !== userId))
            toast.success('تم حذف المستخدم')
          }
          break
      }
    } catch (error) {
      console.error('Error performing user action:', error)
      toast.error('حدث خطأ أثناء تنفيذ العملية')
    }
  }

  const handleAddUser = async () => {
    try {
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast.error('يرجى ملء جميع الحقول المطلوبة')
        return
      }

      const userId = `user-${Date.now()}`
      const userToAdd = {
        id: userId,
        ...newUser,
        avatar: '/api/placeholder/40/40',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        articlesCount: 0,
        gamesPlayed: 0,
        totalScore: 0
      }

      setUsers([...users, userToAdd])
      setNewUser({ name: '', email: '', password: '', role: 'user', status: 'active' })
      setAddUserModal(false)
      toast.success('تم إضافة المستخدم بنجاح')
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error('حدث خطأ أثناء إضافة المستخدم')
    }
  }

  const handleEditUser = async (updatedUser) => {
    try {
      setUsers(users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
      setEditUserModal({ isOpen: false, user: null })
      toast.success('تم تحديث بيانات المستخدم بنجاح')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('حدث خطأ أثناء تحديث المستخدم')
    }
  }

  const handleBulkAction = async (action) => {
    try {
      const selectedIds = bulkActions.selectedUsers
      if (selectedIds.length === 0) return

      switch (action) {
        case 'activate':
          setUsers(users.map(u => selectedIds.includes(u.id) ? { ...u, status: 'active' } : u))
          toast.success(`تم تفعيل ${selectedIds.length} مستخدم`)
          break
        case 'deactivate':
          setUsers(users.map(u => selectedIds.includes(u.id) ? { ...u, status: 'inactive' } : u))
          toast.success(`تم إلغاء تفعيل ${selectedIds.length} مستخدم`)
          break
        case 'ban':
          setUsers(users.map(u => selectedIds.includes(u.id) ? { ...u, status: 'banned' } : u))
          toast.success(`تم حظر ${selectedIds.length} مستخدم`)
          break
        case 'delete':
          if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} مستخدم؟`)) {
            setUsers(users.filter(u => !selectedIds.includes(u.id)))
            toast.success(`تم حذف ${selectedIds.length} مستخدم`)
          }
          break
      }
      setBulkActions({ selectedUsers: [], showActions: false })
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('حدث خطأ أثناء تنفيذ العملية')
    }
  }

  const handleSelectUser = (userId) => {
    const isSelected = bulkActions.selectedUsers.includes(userId)
    if (isSelected) {
      setBulkActions({
        ...bulkActions,
        selectedUsers: bulkActions.selectedUsers.filter(id => id !== userId)
      })
    } else {
      setBulkActions({
        ...bulkActions,
        selectedUsers: [...bulkActions.selectedUsers, userId]
      })
    }
  }

  const handleSelectAll = () => {
    if (bulkActions.selectedUsers.length === filteredUsers.length) {
      setBulkActions({ ...bulkActions, selectedUsers: [] })
    } else {
      setBulkActions({ ...bulkActions, selectedUsers: filteredUsers.map(u => u.id) })
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'نشط' },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'غير نشط' },
      banned: { color: 'bg-red-100 text-red-800', icon: Ban, text: 'محظور' }
    }
    const badge = badges[status]
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: 'bg-purple-100 text-purple-800', icon: Shield, text: 'مدير' },
      moderator: { color: 'bg-blue-100 text-blue-800', icon: ShieldCheck, text: 'مشرف' },
      user: { color: 'bg-gray-100 text-gray-800', icon: Users, text: 'مستخدم' }
    }
    const badge = badges[role]
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loadingUsers) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }


  return (
    <AdminLayout title="إدارة المستخدمين" description="إدارة حسابات المستخدمين وصلاحياتهم">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/admin"
                  className="text-gray-400 hover:text-gray-600 ml-4"
                  legacyBehavior>
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Users className="w-8 h-8 text-primary-600 mr-3" />
                    إدارة المستخدمين
                  </h1>
                  <p className="text-gray-600 mt-1">إدارة حسابات المستخدمين وصلاحياتهم</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <button 
                  onClick={() => setAddUserModal(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة مستخدم
                </button>
                {bulkActions.selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-sm text-gray-600">
                      {bulkActions.selectedUsers.length} مستخدم محدد
                    </span>
                    <button 
                      onClick={() => setBulkActions({...bulkActions, showActions: !bulkActions.showActions})}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      إجراءات جماعية
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="banned">محظور</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">جميع الأدوار</option>
                <option value="admin">مدير</option>
                <option value="moderator">مشرف</option>
                <option value="user">مستخدم</option>
              </select>

              <div className="flex space-x-2 space-x-reverse">
                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  تصدير
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  استيراد
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">المستخدمون النشطون</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">المديرون</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg mr-4">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">المحظورون</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'banned').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={bulkActions.selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الدور
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ التسجيل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      آخر دخول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النشاط
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userData) => (
                    <tr key={userData.id} className={`hover:bg-gray-50 ${bulkActions.selectedUsers.includes(userData.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={bulkActions.selectedUsers.includes(userData.id)}
                          onChange={() => handleSelectUser(userData.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={userData.avatar}
                            alt={userData.name}
                          />
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                            <div className="text-sm text-gray-500">{userData.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(userData.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(userData.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(userData.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(userData.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>{userData.articlesCount} مقال</div>
                          <div className="text-gray-500">{userData.gamesPlayed} لعبة</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <button
                            onClick={() => setEditUserModal({ isOpen: true, user: userData })}
                            className="text-blue-600 hover:text-blue-900"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPermissionsModal({ isOpen: true, user: userData })}
                            className="text-purple-600 hover:text-purple-900"
                            title="الصلاحيات"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          {userData.status === 'active' && (
                            <button
                              onClick={() => handleUserAction(userData.id, 'deactivate')}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="إلغاء التفعيل"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {userData.status === 'inactive' && (
                            <button
                              onClick={() => handleUserAction(userData.id, 'activate')}
                              className="text-green-600 hover:text-green-900"
                              title="تفعيل"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {userData.status !== 'banned' && (
                            <button
                              onClick={() => handleUserAction(userData.id, 'ban')}
                              className="text-red-600 hover:text-red-900"
                              title="حظر"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          {userData.status === 'banned' && (
                            <button
                              onClick={() => handleUserAction(userData.id, 'unban')}
                              className="text-green-600 hover:text-green-900"
                              title="إلغاء الحظر"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {userData.role !== 'admin' && userData.id !== user.id && (
                            <button
                              onClick={() => handleUserAction(userData.id, 'delete')}
                              className="text-red-600 hover:text-red-900"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مستخدمين</h3>
              <p className="mt-1 text-sm text-gray-500">لم يتم العثور على مستخدمين مطابقين للبحث.</p>
            </div>
          )}

          {/* Bulk Actions Panel */}
          {bulkActions.showActions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">الإجراءات الجماعية</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="w-full text-right px-4 py-2 text-green-600 hover:bg-green-50 rounded"
                  >
                    تفعيل المستخدمين المحددين
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="w-full text-right px-4 py-2 text-yellow-600 hover:bg-yellow-50 rounded"
                  >
                    إلغاء تفعيل المستخدمين المحددين
                  </button>
                  <button
                    onClick={() => handleBulkAction('ban')}
                    className="w-full text-right px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    حظر المستخدمين المحددين
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="w-full text-right px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    حذف المستخدمين المحددين
                  </button>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setBulkActions({...bulkActions, showActions: false})}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {addUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">إضافة مستخدم جديد</h3>
                <button
                  onClick={() => setAddUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="أدخل كلمة المرور"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="user">مستخدم</option>
                    <option value="moderator">مشرف</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse mt-6">
                <button
                  onClick={() => setAddUserModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editUserModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">تعديل المستخدم</h3>
                <button
                  onClick={() => setEditUserModal({ isOpen: false, user: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                  <input
                    type="text"
                    value={editUserModal.user?.name || ''}
                    onChange={(e) => setEditUserModal({
                      ...editUserModal,
                      user: { ...editUserModal.user, name: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editUserModal.user?.email || ''}
                    onChange={(e) => setEditUserModal({
                      ...editUserModal,
                      user: { ...editUserModal.user, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                  <select
                    value={editUserModal.user?.role || 'user'}
                    onChange={(e) => setEditUserModal({
                      ...editUserModal,
                      user: { ...editUserModal.user, role: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="user">مستخدم</option>
                    <option value="moderator">مشرف</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select
                    value={editUserModal.user?.status || 'active'}
                    onChange={(e) => setEditUserModal({
                      ...editUserModal,
                      user: { ...editUserModal.user, status: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="banned">محظور</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse mt-6">
                <button
                  onClick={() => setEditUserModal({ isOpen: false, user: null })}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleEditUser(editUserModal.user)}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Modal */}
        {permissionsModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">إدارة الصلاحيات</h3>
                <button
                  onClick={() => setPermissionsModal({ isOpen: false, user: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">معلومات المستخدم</h4>
                  <p className="text-sm text-gray-600">الاسم: {permissionsModal.user?.name}</p>
                  <p className="text-sm text-gray-600">البريد: {permissionsModal.user?.email}</p>
                  <p className="text-sm text-gray-600">الدور الحالي: {permissionsModal.user?.role}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">تغيير الدور</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleUserAction(permissionsModal.user.id, 'make_user')
                        setPermissionsModal({ isOpen: false, user: null })
                      }}
                      className="w-full text-right px-4 py-2 text-gray-600 hover:bg-gray-50 rounded border"
                    >
                      مستخدم عادي
                    </button>
                    <button
                      onClick={() => {
                        handleUserAction(permissionsModal.user.id, 'make_moderator')
                        setPermissionsModal({ isOpen: false, user: null })
                      }}
                      className="w-full text-right px-4 py-2 text-blue-600 hover:bg-blue-50 rounded border"
                    >
                      مشرف
                    </button>
                    <button
                      onClick={() => {
                        handleUserAction(permissionsModal.user.id, 'make_admin')
                        setPermissionsModal({ isOpen: false, user: null })
                      }}
                      className="w-full text-right px-4 py-2 text-purple-600 hover:bg-purple-50 rounded border"
                    >
                      مدير
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setPermissionsModal({ isOpen: false, user: null })}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default UsersManagement