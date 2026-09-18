import React, { useState, useEffect } from 'react';

import { Navbar } from '../../components/Navbar';

import {
  listUsersApi,
  createUserApi,
  updateUserApi,
  deactivateUserApi,
  bulkUploadUsersApi,
} from '../../api/admin';

import {
  UserPlus,
  Edit2,
  Trash2,
  X,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  AlertCircle,
  Upload,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export const Users = () => {

  // ==========================================================
  // USERS
  // ==========================================================

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // CREATE / EDIT USER MODAL
  // ==========================================================

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    section: '',
    is_active: true,
  });

  // ==========================================================
  // MAKE ADMIN
  // ==========================================================

  const [makeAdmin, setMakeAdmin] = useState(false);

  // ==========================================================
  // CSV IMPORT MODAL
  // ==========================================================

  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvRole, setCsvRole] = useState('student');
  const [csvLoading, setCsvLoading] = useState(false);

  // ==========================================================
  // MESSAGES
  // ==========================================================

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ==========================================================
  // FETCH USERS
  // ==========================================================

  const fetchUsers = async () => {

    setLoading(true);

    try {

      const data = await listUsersApi(
        roleFilter || null
      );

      setUsers(data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        'Failed to fetch users'
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchUsers();

  }, [roleFilter]);

  // ==========================================================
  // CREATE USER
  // ==========================================================

  const handleOpenCreate = () => {

    setEditingUser(null);

    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      section: '',
      is_active: true,
    });

    setMakeAdmin(false);

    setError(null);
    setSuccess(null);

    setShowModal(true);

  };

  // ==========================================================
  // EDIT USER
  // ==========================================================

  const handleOpenEdit = (user) => {

    setEditingUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      section: user.section || '',
      is_active: user.is_active,
    });

    // If the current user is already admin,
    // checkbox should appear checked.

    setMakeAdmin(
      user.role === 'admin'
    );

    setError(null);
    setSuccess(null);

    setShowModal(true);

  };

  // ==========================================================
  // MAKE ADMIN TOGGLE
  // ==========================================================

  const handleMakeAdminToggle = (checked) => {

    setMakeAdmin(checked);

    if (checked) {

      setFormData((previous) => ({
        ...previous,
        role: 'admin',
      }));

    } else {

      /*
       * If admin checkbox is unchecked,
       * restore the original role when possible.
       *
       * If the original user was already an admin,
       * default back to faculty so the account
       * does not remain admin accidentally.
       */

      const originalRole =
        editingUser?.role;

      const restoredRole =
        originalRole &&
        originalRole !== 'admin'
          ? originalRole
          : 'faculty';

      setFormData((previous) => ({
        ...previous,
        role: restoredRole,
      }));

    }

  };

  // ==========================================================
  // CREATE / UPDATE SUBMIT
  // ==========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError(null);
    setSuccess(null);

    try {

      if (editingUser) {

        const updatePayload = {
          ...formData,

          // Make sure checkbox selection
          // always controls the final role.
          role: makeAdmin
            ? 'admin'
            : formData.role,
        };

        if (!updatePayload.password) {

          delete updatePayload.password;

        }

        await updateUserApi(
          editingUser.id,
          updatePayload
        );

        setSuccess(
          makeAdmin
            ? 'User has been made an Admin successfully'
            : 'User updated successfully'
        );

      } else {

        await createUserApi(formData);

        setSuccess(
          'User created successfully'
        );

      }

      setShowModal(false);

      setMakeAdmin(false);

      await fetchUsers();

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        'Operation failed'
      );

    }

  };

  // ==========================================================
  // DEACTIVATE / DELETE
  // ==========================================================

  const handleDeactivate = async (
    userId,
    hard = false
  ) => {

    const message = hard
      ? 'Are you sure you want to PERMANENTLY delete this user?'
      : 'Deactivate user?';

    if (!window.confirm(message)) {

      return;

    }

    try {

      await deactivateUserApi(
        userId,
        hard
      );

      await fetchUsers();

    } catch (err) {

      alert(
        err.response?.data?.detail ||
        'Action failed'
      );

    }

  };

  // ==========================================================
  // OPEN CSV MODAL
  // ==========================================================

  const handleOpenCsvModal = () => {

    setCsvFile(null);
    setCsvRole('student');

    setError(null);
    setSuccess(null);

    setShowCsvModal(true);

  };

  // ==========================================================
  // CLOSE CSV MODAL
  // ==========================================================

  const handleCloseCsvModal = () => {

    if (csvLoading) {

      return;

    }

    setShowCsvModal(false);
    setCsvFile(null);

  };

  // ==========================================================
  // CSV FILE SELECT
  // ==========================================================

  const handleCsvFileChange = (e) => {

    const file = e.target.files?.[0];

    setError(null);
    setSuccess(null);

    if (!file) {

      setCsvFile(null);

      return;

    }

    if (
      !file.name
        .toLowerCase()
        .endsWith('.csv')
    ) {

      setError(
        'Please select a CSV file only.'
      );

      setCsvFile(null);

      e.target.value = '';

      return;

    }

    setCsvFile(file);

  };

  // ==========================================================
  // CSV UPLOAD
  // ==========================================================

  const handleCsvUpload = async () => {

    setError(null);
    setSuccess(null);

    if (!csvRole) {

      setError(
        'Please select a user role.'
      );

      return;

    }

    if (!csvFile) {

      setError(
        'Please select a CSV file.'
      );

      return;

    }

    try {

      setCsvLoading(true);

      const result =
        await bulkUploadUsersApi(
          csvFile,
          csvRole
        );

      setSuccess(
        `${result.created} ${result.role} users imported successfully. ` +
        `${result.skipped} skipped, ${result.errors} errors.`
      );

      setShowCsvModal(false);

      setCsvFile(null);

      await fetchUsers();

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        'CSV import failed'
      );

    } finally {

      setCsvLoading(false);

    }

  };

  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="min-h-screen bg-[#F0F2F5] text-[#0D0F0D] flex flex-col selection:bg-[#9BE5E3]">

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>

            <div className="flex items-center gap-2 mb-1.5">

              <Badge
                variant="warm"
                size="sm"
                icon={ShieldCheck}
              >

                Administrator Console

              </Badge>

            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0D0F0D] tracking-tight">

              User Management

            </h1>

            <p className="text-xs sm:text-sm text-[#3D3F4A] mt-1">

              Provision and manage Faculty, Student, and Administrator accounts

            </p>

          </div>

          {/* HEADER BUTTONS */}

          <div className="flex items-center gap-3">

            {/* IMPORT CSV */}

            <Button
              variant="secondary"
              size="md"
              icon={Upload}
              onClick={handleOpenCsvModal}
            >

              Import CSV

            </Button>

            {/* ADD NEW USER */}

            <Button
              variant="primary"
              size="md"
              icon={UserPlus}
              onClick={handleOpenCreate}
            >

              Add New User

            </Button>

          </div>

        </div>

        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {success && (

          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">

            <CheckCircle className="w-4 h-4" />

            <span>{success}</span>

            <button
              onClick={() => setSuccess(null)}
              className="ml-auto"
            >

              <X className="w-4 h-4" />

            </button>

          </div>

        )}

        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {error &&
          !showModal &&
          !showCsvModal && (

          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">

            <AlertCircle className="w-4 h-4" />

            <span>{error}</span>

            <button
              onClick={() => setError(null)}
              className="ml-auto"
            >

              <X className="w-4 h-4" />

            </button>

          </div>

        )}

        {/* ==================================================
            FILTER BAR
        ================================================== */}

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">

          {[
            '',
            'faculty',
            'student',
            'admin',
          ].map((role) => (

            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                roleFilter === role
                  ? 'bg-[#3DA8A5] text-white shadow-sd-sm'
                  : 'bg-white border border-[#E4E8EE] text-[#3D3F4A] hover:text-[#0D0F0D]'
              }`}
            >

              {role
                ? `${role}s`
                : 'All Accounts'}

            </button>

          ))}

        </div>

        {/* ==================================================
            USERS TABLE
        ================================================== */}

        <Card className="p-0 overflow-hidden shadow-sd-md bg-white border-[#E4E8EE]">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm text-[#3D3F4A]">

              <thead className="bg-[#FAFBFB] border-b border-[#E4E8EE] text-[11px] uppercase font-extrabold text-[#8A8B97] tracking-wider">

                <tr>

                  <th className="px-6 py-4">
                    User
                  </th>

                  <th className="px-6 py-4">
                    Role
                  </th>

                  <th className="px-6 py-4">
                    Section
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-[#F0F2F5]">

                {loading ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-xs text-[#8A8B97]"
                    >

                      Loading user accounts...

                    </td>

                  </tr>

                ) : users.length === 0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-xs text-[#8A8B97]"
                    >

                      No accounts found.

                    </td>

                  </tr>

                ) : (

                  users.map((u) => (

                    <tr
                      key={u.id}
                      className="hover:bg-[#FAFBFB] transition-colors"
                    >

                      {/* USER */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-2xl bg-[#3DA8A5]/10 text-[#3DA8A5] font-extrabold flex items-center justify-center">

                            {u.name?.[0]?.toUpperCase()}

                          </div>

                          <div>

                            <span className="font-extrabold text-[#0D0F0D] block">

                              {u.name}

                            </span>

                            <span className="text-xs text-[#8A8B97]">

                              {u.email}

                            </span>

                          </div>

                        </div>

                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-4">

                        {u.role === 'admin' && (

                          <Badge
                            variant="warm"
                            size="sm"
                            icon={ShieldCheck}
                          >

                            Admin

                          </Badge>

                        )}

                        {u.role === 'faculty' && (

                          <Badge
                            variant="blue"
                            size="sm"
                            icon={Sparkles}
                          >

                            Faculty

                          </Badge>

                        )}

                        {u.role === 'student' && (

                          <Badge
                            variant="cyan"
                            size="sm"
                            icon={GraduationCap}
                          >

                            Student

                          </Badge>

                        )}

                      </td>

                      {/* SECTION */}

                      <td className="px-6 py-4 font-mono text-xs">

                        {u.section ? (

                          <span className="px-2.5 py-1 rounded-full bg-[#F0F2F5] border border-[#E4E8EE] text-[#0D0F0D] font-bold">

                            {u.section}

                          </span>

                        ) : (

                          <span className="text-[#B8BAC4]">
                            —
                          </span>

                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        {u.is_active ? (

                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">

                            <span className="w-2 h-2 rounded-full bg-emerald-500" />

                            Active

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600">

                            <span className="w-2 h-2 rounded-full bg-rose-500" />

                            Inactive

                          </span>

                        )}

                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4 text-right">

                        <div className="flex items-center justify-end gap-1.5">

                          <button
                            onClick={() =>
                              handleOpenEdit(u)
                            }
                            className="p-2 rounded-xl text-[#8A8B97] hover:text-[#0D0F0D] hover:bg-[#F0F2F5] transition-colors cursor-pointer"
                            title="Edit Account"
                          >

                            <Edit2 className="w-4 h-4" />

                          </button>

                          <button
                            onClick={() =>
                              handleDeactivate(
                                u.id,
                                false
                              )
                            }
                            className="p-2 rounded-xl text-[#8A8B97] hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Deactivate Account"
                          >

                            <X className="w-4 h-4" />

                          </button>

                          <button
                            onClick={() =>
                              handleDeactivate(
                                u.id,
                                true
                              )
                            }
                            className="p-2 rounded-xl text-[#8A8B97] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Permanently"
                          >

                            <Trash2 className="w-4 h-4" />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </Card>

        {/* ==================================================
            CREATE / EDIT USER MODAL
        ================================================== */}

        {showModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">

            <div className="bg-white border border-[#E4E8EE] rounded-4xl w-full max-w-md shadow-sd-xl overflow-hidden">

              {/* MODAL HEADER */}

              <div className="p-5 border-b border-[#F0F2F5] flex items-center justify-between bg-[#FAFBFB]">

                <h3 className="text-sm font-extrabold text-[#0D0F0D]">

                  {editingUser
                    ? 'Edit User Account'
                    : 'Create New Account'}

                </h3>

                <button
                  onClick={() => {

                    setShowModal(false);
                    setMakeAdmin(false);

                  }}
                  className="p-1.5 rounded-xl text-[#8A8B97] hover:text-[#0D0F0D] hover:bg-[#F0F2F5]"
                >

                  <X className="w-4 h-4" />

                </button>

              </div>

              {/* MODAL ERROR */}

              {error && (

                <div className="m-5 mb-0 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">

                  <AlertCircle className="w-4 h-4" />

                  {error}

                </div>

              )}

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="p-5 space-y-4"
              >

                <Input
                  label="Full Name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                />

                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />

                <Input
                  label={`Password ${
                    editingUser
                      ? '(leave blank to keep unchanged)'
                      : ''
                  }`}
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  placeholder={
                    editingUser
                      ? '••••••••'
                      : 'Password'
                  }
                />

                <div className="grid grid-cols-2 gap-3">

                  {/* ROLE */}

                  <div>

                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3F4A] mb-1.5">

                      Role

                    </label>

                    <select
                      value={formData.role}
                      onChange={(e) => {

                        const selectedRole =
                          e.target.value;

                        setFormData({
                          ...formData,
                          role: selectedRole,
                        });

                        setMakeAdmin(
                          selectedRole === 'admin'
                        );

                      }}
                      className="w-full bg-[#FAFBFB] border border-[#E4E8EE] rounded-2xl px-3.5 py-2.5 text-sm text-[#0D0F0D] focus:outline-none focus:border-[#3DA8A5] font-medium"
                    >

                      <option value="student">
                        Student
                      </option>

                      <option value="faculty">
                        Faculty
                      </option>

                      <option value="admin">
                        Admin
                      </option>

                    </select>

                  </div>

                  {/* SECTION */}

                  <Input
                    label="Section"
                    placeholder="e.g. 4-CSM-C"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        section: e.target.value,
                      })
                    }
                  />

                </div>

                {/* ==================================================
                    MAKE ADMIN OPTION
                ================================================== */}

                {editingUser && (

                  <div className="pt-1">

                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        makeAdmin
                          ? 'bg-[#FEF9E8] border-[#E8D58A]'
                          : 'bg-[#FAFBFB] border-[#E4E8EE] hover:border-[#3DA8A5]'
                      }`}
                    >

                      <input
                        type="checkbox"
                        checked={makeAdmin}
                        onChange={(e) =>
                          handleMakeAdminToggle(
                            e.target.checked
                          )
                        }
                        className="mt-0.5 w-4 h-4 rounded border-[#E4E8EE] text-[#3DA8A5] focus:ring-[#3DA8A5]"
                      />

                      <div>

                        <div className="flex items-center gap-2">

                          <ShieldCheck
                            className={`w-4 h-4 ${
                              makeAdmin
                                ? 'text-[#A68100]'
                                : 'text-[#8A8B97]'
                            }`}
                          />

                          <span className="text-xs font-extrabold text-[#0D0F0D]">

                            Make this user an Admin

                          </span>

                        </div>

                        <p className="text-[10px] text-[#7B7D88] mt-1 leading-relaxed">

                          Give this account access to the
                          Admin Dashboard and administrative
                          features.

                        </p>

                      </div>

                    </label>

                    {makeAdmin && (

                      <div className="mt-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">

                        <p className="text-[10px] font-semibold text-amber-700">

                          ⚠ This user will have Admin access
                          after saving the changes.

                        </p>

                      </div>

                    )}

                  </div>

                )}

                {/* ACTIVE */}

                <div className="flex items-center gap-2 pt-2">

                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active:
                          e.target.checked,
                      })
                    }
                    className="rounded border-[#E4E8EE] text-[#3DA8A5]"
                  />

                  <label
                    htmlFor="isActiveCheck"
                    className="text-xs font-semibold text-[#3D3F4A]"
                  >

                    Account is Active

                  </label>

                </div>

                {/* ACTIONS */}

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F0F2F5]">

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {

                      setShowModal(false);
                      setMakeAdmin(false);

                    }}
                  >

                    Cancel

                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                  >

                    {editingUser
                      ? 'Save Changes'
                      : 'Create Account'}

                  </Button>

                </div>

              </form>

            </div>

          </div>

        )}

        {/* ==================================================
            CSV IMPORT MODAL
        ================================================== */}

        {showCsvModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">

            <div className="bg-white border border-[#E4E8EE] rounded-4xl w-full max-w-md shadow-sd-xl overflow-hidden">

              {/* MODAL HEADER */}

              <div className="p-5 border-b border-[#F0F2F5] flex items-center justify-between bg-[#FAFBFB]">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-xl bg-[#E6FAF9] text-[#3DA8A5] flex items-center justify-center">

                    <FileSpreadsheet className="w-5 h-5" />

                  </div>

                  <h3 className="text-sm font-extrabold text-[#0D0F0D]">

                    Import CSV

                  </h3>

                </div>

                <button
                  onClick={handleCloseCsvModal}
                  disabled={csvLoading}
                  className="p-1.5 rounded-xl text-[#8A8B97] hover:text-[#0D0F0D] hover:bg-[#F0F2F5] disabled:opacity-50"
                >

                  <X className="w-4 h-4" />

                </button>

              </div>

              {/* CSV MODAL ERROR */}

              {error && (

                <div className="mx-5 mt-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">

                  <AlertCircle className="w-4 h-4 flex-shrink-0" />

                  <span>{error}</span>

                </div>

              )}

              {/* CSV FORM */}

              <div className="p-5 space-y-5">

                {/* ROLE */}

                <div>

                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3F4A] mb-1.5">

                    User Role

                  </label>

                  <select
                    value={csvRole}
                    onChange={(e) => {

                      setCsvRole(e.target.value);
                      setError(null);

                    }}
                    disabled={csvLoading}
                    className="w-full bg-[#FAFBFB] border border-[#E4E8EE] rounded-2xl px-3.5 py-3 text-sm text-[#0D0F0D] focus:outline-none focus:border-[#3DA8A5] font-medium disabled:opacity-60"
                  >

                    <option value="student">
                      Student
                    </option>

                    <option value="faculty">
                      Faculty
                    </option>

                  </select>

                </div>

                {/* FILE */}

                <div>

                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3F4A] mb-1.5">

                    CSV File

                  </label>

                  <label
                    htmlFor="csvFileInput"
                    className={`flex items-center gap-3 w-full bg-[#FAFBFB] border border-[#E4E8EE] rounded-2xl px-4 py-3 cursor-pointer transition-colors ${
                      csvLoading
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:border-[#3DA8A5]'
                    }`}
                  >

                    <div className="w-9 h-9 rounded-xl bg-[#E6FAF9] text-[#3DA8A5] flex items-center justify-center flex-shrink-0">

                      <Upload className="w-4 h-4" />

                    </div>

                    <div className="min-w-0">

                      <span className="block text-xs font-bold text-[#0D0F0D] truncate">

                        {csvFile
                          ? csvFile.name
                          : 'Choose CSV file'}

                      </span>

                      <span className="block text-[10px] text-[#8A8B97] mt-0.5">

                        CSV files only

                      </span>

                    </div>

                  </label>

                  <input
                    id="csvFileInput"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCsvFileChange}
                    disabled={csvLoading}
                    className="hidden"
                  />

                </div>

                {/* CSV FORMAT INFO */}

                <div className="p-3 rounded-2xl bg-[#FAFBFB] border border-[#E4E8EE]">

                  <p className="text-[10px] text-[#8A8B97] leading-relaxed">

                    <span className="font-bold text-[#3D3F4A]">

                      Student CSV:

                    </span>{' '}

                    Rollno, First Name, Official Email, passwords

                    <br />

                    <span className="font-bold text-[#3D3F4A]">

                      Faculty CSV:

                    </span>{' '}

                    Name, Official mail id, Temporary password

                  </p>

                </div>

                {/* BUTTONS */}

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F0F2F5]">

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseCsvModal}
                    disabled={csvLoading}
                  >

                    Cancel

                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    icon={Upload}
                    onClick={handleCsvUpload}
                    disabled={
                      csvLoading ||
                      !csvFile
                    }
                  >

                    {csvLoading
                      ? 'Importing...'
                      : 'Import CSV'}

                  </Button>

                </div>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>

  );

};