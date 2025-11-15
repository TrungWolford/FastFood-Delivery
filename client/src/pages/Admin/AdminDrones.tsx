import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import LeftTaskbar from '../../components/LeftTaskbar';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdowns/dropdown-menu';
import { Search, Drone as DroneIcon, Plus, Edit, Eye, RefreshCw, Battery } from 'lucide-react';
import droneService from '../../services/droneService';
import type { Drone, CreateDroneRequest, UpdateDroneRequest } from '../../types/fastfood';

const DRONE_STATUS_LABEL: Record<number, string> = {
  0: 'Bảo trì',
  1: 'Sẵn sàng',
  2: 'Đang giao',
};

const AdminDrones: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const restaurantId = user?.restaurantId;

  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Dialogs
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);

  // Form
  const [formData, setFormData] = useState<Partial<CreateDroneRequest & { droneId?: string }>>({
    droneCode: '',
    model: '',
    batteryLevel: 100,
    status: 1,
  });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const loadDrones = async (page = 0) => {
    if (!restaurantId) {
      console.warn('Restaurant ID not found, showing empty list');
      setDrones([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const resp = await droneService.getDronesByRestaurant(restaurantId, page, itemsPerPage);
      let list = (resp as any).content || [];
      
      // Apply client-side filtering if needed
      if (statusFilter !== 'all') {
        const filterStatus = parseInt(statusFilter);
        list = list.filter((d: Drone) => d.status === filterStatus);
      }
      
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        list = list.filter((d: Drone) => 
          d.droneCode?.toLowerCase().includes(searchLower) ||
          d.model?.toLowerCase().includes(searchLower)
        );
      }
      
      setDrones(list);
      setTotalItems((resp as any).totalElements ?? list.length);
      setTotalPages((resp as any).totalPages ?? Math.max(1, Math.ceil(((resp as any).totalElements ?? list.length) / itemsPerPage)));
    } catch (error) {
      console.error('Error loading drones:', error);
      toast.error('Lỗi khi tải danh sách drone');
      setDrones([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      loadDrones(currentPage - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchTerm, statusFilter, restaurantId]);

  // Stats
  const droneStats = {
    total: drones.length,
    available: drones.filter((d) => d.status === 1).length,
    delivering: drones.filter((d) => d.status === 2).length,
    maintenance: drones.filter((d) => d.status === 0).length,
  };

  const handleView = (drone: Drone) => {
    setSelectedDrone(drone);
    setIsViewDialogOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({ droneCode: '', model: '', batteryLevel: 100, status: 1 });
    setIsCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.droneCode || !formData.model) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      await droneService.createDrone({
        droneCode: formData.droneCode as string,
        model: formData.model as string,
        batteryLevel: formData.batteryLevel ?? 100,
        status: formData.status ?? 1,
        restaurantId: restaurantId,
      } as CreateDroneRequest);
      toast.success('Tạo drone thành công');
      setIsCreateDialogOpen(false);
      loadDrones(currentPage - 1);
    } catch (error) {
      console.error('Create drone error:', error);
      toast.error('Tạo drone thất bại');
    }
  };

  const openEditDialog = (drone: Drone) => {
    setSelectedDrone(drone);
    setFormData({
      droneId: drone.droneId,
      droneCode: drone.droneCode,
      model: drone.model,
      batteryLevel: drone.batteryLevel,
      status: drone.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedDrone) return;
    try {
      const updateData: UpdateDroneRequest = {
        droneCode: formData.droneCode,
        model: formData.model,
        batteryLevel: formData.batteryLevel,
        status: formData.status,
      };
      await droneService.updateDrone(selectedDrone.droneId, updateData);
      toast.success('Cập nhật drone thành công');
      setIsEditDialogOpen(false);
      setSelectedDrone(null);
      loadDrones(currentPage - 1);
    } catch (error) {
      console.error('Update drone error:', error);
      toast.error('Cập nhật drone thất bại');
    }
  };

  const handleChangeStatus = async (drone: Drone) => {
    try {
      await droneService.changeDroneStatus(drone.droneId);
      toast.success('Thay đổi trạng thái thành công');
      loadDrones(currentPage - 1);
    } catch (error) {
      console.error('Change status error:', error);
      toast.error('Thay đổi trạng thái thất bại');
    }
  };

  const formatBattery = (b?: number) => (typeof b === 'number' ? `${b}%` : 'N/A');

  // Show message if no restaurant ID
  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LeftTaskbar />
        <div className="ml-64 p-4">
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <DroneIcon className="w-5 h-5 text-amber-500" /> Quản lý Drone
            </h1>
          </div>
          <div className="bg-white shadow-sm border border-gray-200 p-8 rounded-lg text-center">
            <DroneIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700">Không tìm thấy thông tin nhà hàng</p>
            <p className="text-sm text-gray-500 mt-2">Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LeftTaskbar />

      <div className="ml-64 p-4">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <DroneIcon className="w-5 h-5 text-amber-500" /> Quản lý Drone
          </h1>
          <p className="text-gray-600 mt-0.5 text-base">Quản lý các drone thuộc nhà hàng của bạn</p>
        </div>

        {/* Search & Actions */}
        <div className="bg-slate-800 shadow-sm border border-slate-700 p-3 mb-3 rounded-lg">
          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm drone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 py-2 text-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 rounded-md"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-44 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 rounded-md">
                    {statusFilter === 'all' ? 'Tất cả' : statusFilter === '0' ? 'Bảo trì' : statusFilter === '1' ? 'Sẵn sàng' : 'Đang giao'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-gray-200 shadow-lg">
                  <DropdownMenuItem onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter('1'); setCurrentPage(1); }}>Sẵn sàng</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter('2'); setCurrentPage(1); }}>Đang giao</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter('0'); setCurrentPage(1); }}>Bảo trì</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={openCreateDialog} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Thêm Drone
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Tổng drone</div>
            <div className="text-2xl font-bold text-gray-900">{droneStats.total}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Sẵn sàng</div>
            <div className="text-2xl font-bold text-green-600">{droneStats.available}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Đang giao</div>
            <div className="text-2xl font-bold text-blue-600">{droneStats.delivering}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Bảo trì</div>
            <div className="text-2xl font-bold text-orange-600">{droneStats.maintenance}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-slate-800 hover:bg-slate-800 border-b border-slate-700">
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-36">Mã Drone</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-left text-sm">Model</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-28">Pin</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-32">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-36">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <TableRow key={`s-${idx}`}>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-center">
                          <Skeleton className="h-6 w-24 rounded" />
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Skeleton className="h-6 w-28 rounded-full" />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Skeleton className="h-8 w-28 rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : drones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                      <DroneIcon className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">Không tìm thấy drone</p>
                      <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc thêm drone mới</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  drones.map((drone) => (
                    <TableRow key={drone.droneId} className={`transition-all duration-200 cursor-pointer hover:bg-blue-50/50`}>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <div className="px-2 py-1 bg-amber-100 rounded flex items-center gap-1.5">
                            <DroneIcon className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-xs font-bold text-amber-600">#{drone.droneCode}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="font-medium text-gray-900">{drone.model}</div>
                        <div className="text-xs text-gray-500 mt-0.5">ID: {drone.droneId}</div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Battery className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">{formatBattery(drone.batteryLevel)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Badge variant="default" className={`px-2 py-1 text-xs font-medium ${drone.status === 1 ? 'bg-green-600 text-white' : drone.status === 2 ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-white'}`}>
                          {DRONE_STATUS_LABEL[drone.status ?? 0] || 'Không xác định'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(drone)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md">
                            <Eye className="w-3.5 h-3.5 mr-1.5" /> Chi tiết
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(drone)} className="bg-amber-50 hover:bg-amber-100 text-amber-600 px-3 py-1.5 rounded-md">
                            <Edit className="w-3.5 h-3.5 mr-1.5" /> Sửa
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleChangeStatus(drone)} className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md">
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Đổi trạng thái
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                <div className="text-sm text-gray-600 font-medium">Hiển thị trang {currentPage} trên {totalPages} (Tổng: {totalItems} drone)</div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1">Prev</Button>
                  <Button variant="ghost" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1">Next</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chi tiết Drone</DialogTitle>
              <DialogDescription>Thông tin chi tiết về drone</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <div><strong>Mã:</strong> {selectedDrone?.droneCode}</div>
              <div><strong>Model:</strong> {selectedDrone?.model}</div>
              <div><strong>Pin:</strong> {formatBattery(selectedDrone?.batteryLevel)}</div>
              <div><strong>Trạng thái:</strong> {DRONE_STATUS_LABEL[selectedDrone?.status ?? 0]}</div>
              <div><strong>Location:</strong> {selectedDrone?.currentLocation || 'N/A'}</div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Drone</DialogTitle>
              <DialogDescription>Tạo drone mới cho nhà hàng</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-2 mt-2">
              <label className="text-sm">Mã Drone</label>
              <Input value={formData.droneCode || ''} onChange={(e) => setFormData((s) => ({ ...s, droneCode: e.target.value }))} />

              <label className="text-sm">Model</label>
              <Input value={formData.model || ''} onChange={(e) => setFormData((s) => ({ ...s, model: e.target.value }))} />

              <label className="text-sm">Pin (%)</label>
              <Input type="number" value={formData.batteryLevel ?? 100} onChange={(e) => setFormData((s) => ({ ...s, batteryLevel: Number(e.target.value) }))} />

            </div>

            <DialogFooter>
              <Button onClick={() => setIsCreateDialogOpen(false)} variant="ghost">Hủy</Button>
              <Button onClick={handleCreate}>Tạo Drone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập nhật Drone</DialogTitle>
              <DialogDescription>Chỉnh sửa thông tin drone</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-2 mt-2">
              <label className="text-sm">Mã Drone</label>
              <Input value={formData.droneCode || ''} onChange={(e) => setFormData((s) => ({ ...s, droneCode: e.target.value }))} />

              <label className="text-sm">Model</label>
              <Input value={formData.model || ''} onChange={(e) => setFormData((s) => ({ ...s, model: e.target.value }))} />

              <label className="text-sm">Pin (%)</label>
              <Input type="number" value={formData.batteryLevel ?? 100} onChange={(e) => setFormData((s) => ({ ...s, batteryLevel: Number(e.target.value) }))} />

            </div>

            <DialogFooter>
              <Button onClick={() => setIsEditDialogOpen(false)} variant="ghost">Hủy</Button>
              <Button onClick={handleUpdate}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default AdminDrones;
