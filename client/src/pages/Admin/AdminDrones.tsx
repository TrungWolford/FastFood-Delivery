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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Search, Drone as DroneIcon, Plus, Edit, Eye, RefreshCw, Battery, Package } from 'lucide-react';
import droneService from '../../services/droneService';
import type { Drone, CreateDroneRequest, UpdateDroneRequest } from '../../types/fastfood';

const DRONE_STATUS_LABEL: Record<string, string> = {
  'AVAILABLE': 'Sẵn sàng',
  'IN_USE': 'Đang giao',
  'MAINTENANCE': 'Bảo trì',
};

const DRONE_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Sẵn sàng', color: 'bg-green-600' },
  { value: 'IN_USE', label: 'Đang giao', color: 'bg-blue-600' },
  { value: 'MAINTENANCE', label: 'Bảo trì', color: 'bg-yellow-600' },
];

const AdminDrones: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const restaurantId = user?.restaurantId;

  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);

  const [formData, setFormData] = useState<Partial<CreateDroneRequest & UpdateDroneRequest & { droneId?: string }>>({
    model: '',
    capacity: 10,
    battery: 100,
    status: 'AVAILABLE',
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const loadDrones = async (page = 0) => {
    if (!restaurantId) {
      console.warn('Restaurant ID not found');
      setDrones([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const resp = await droneService.getDronesByRestaurant(restaurantId, page, itemsPerPage);
      let list = (resp as any).content || [];
      
      if (statusFilter !== 'all') {
        list = list.filter((d: Drone) => d.status === statusFilter);
      }
      
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        list = list.filter((d: Drone) => 
          d.model?.toLowerCase().includes(searchLower) ||
          d.droneId?.toLowerCase().includes(searchLower)
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
  }, [currentPage, debouncedSearchTerm, statusFilter, restaurantId]);

  const droneStats = {
    total: drones.length,
    available: drones.filter((d) => d.status === 'AVAILABLE').length,
    delivering: drones.filter((d) => d.status === 'IN_USE').length,
    maintenance: drones.filter((d) => d.status === 'MAINTENANCE').length,
  };

  const handleView = (drone: Drone) => {
    setSelectedDrone(drone);
    setIsViewDialogOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({ 
      model: '', 
      capacity: 10, 
      battery: 100, 
      status: 'AVAILABLE',
      restaurantId: restaurantId 
    });
    setIsCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.model || !formData.capacity || !formData.battery) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (!restaurantId) {
      toast.error('Không tìm thấy thông tin nhà hàng');
      return;
    }

    try {
      const createRequest: CreateDroneRequest = {
        restaurantId: restaurantId,
        model: formData.model as string,
        capacity: formData.capacity as number,
        battery: formData.battery as number,
      };
      
      await droneService.createDrone(createRequest);
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
      model: drone.model,
      capacity: drone.capacity,
      battery: drone.battery,
      status: drone.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedDrone) return;
    
    try {
      const updateData: UpdateDroneRequest = {
        model: formData.model,
        capacity: formData.capacity,
        battery: formData.battery,
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

  const formatBattery = (b?: number) => (typeof b === 'number' ? `${b.toFixed(0)}%` : 'N/A');
  const formatCapacity = (c?: number) => (typeof c === 'number' ? `${c.toFixed(1)} kg` : 'N/A');

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

  const getStatusColor = (status: string) => {
    const option = DRONE_STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.color || 'bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LeftTaskbar />
      <div className="ml-64 p-4">
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <DroneIcon className="w-5 h-5 text-amber-500" /> Quản lý Drone
          </h1>
          <p className="text-gray-600 mt-0.5 text-base">Quản lý các drone thuộc nhà hàng của bạn</p>
        </div>

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
                    {statusFilter === 'all' ? 'Tất cả' : DRONE_STATUS_LABEL[statusFilter] || statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-gray-200 shadow-lg">
                  <DropdownMenuItem onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter('AVAILABLE'); setCurrentPage(1); }}>Sẵn sàng</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter('IN_USE'); setCurrentPage(1); }}>Đang giao</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter('MAINTENANCE'); setCurrentPage(1); }}>Bảo trì</DropdownMenuItem>
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

        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-slate-800 hover:bg-slate-800 border-b border-slate-700">
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-32">Mã Drone</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-left text-sm">Model</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-28">Sức chứa</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-24">Pin</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-32">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-40">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <TableRow key={`s-${idx}`}>
                      <TableCell className="px-4 py-3"><div className="flex justify-center"><Skeleton className="h-6 w-24 rounded" /></div></TableCell>
                      <TableCell className="px-4 py-3"><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell className="px-4 py-3 text-center"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="px-4 py-3 text-center"><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell className="px-4 py-3 text-center"><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                      <TableCell className="px-4 py-3 text-center"><Skeleton className="h-8 w-32 rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : drones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      <DroneIcon className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">Không tìm thấy drone</p>
                      <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc thêm drone mới</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  drones.map((drone) => (
                    <TableRow key={drone.droneId} className="transition-all duration-200 cursor-pointer hover:bg-blue-50/50">
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <div className="px-2 py-1 bg-amber-100 rounded flex items-center gap-1.5">
                            <DroneIcon className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-xs font-bold text-amber-600">#{drone.droneId.substring(0, 8)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="font-medium text-gray-900">{drone.model}</div>
                        <div className="text-xs text-gray-500 mt-0.5">ID: {drone.droneId}</div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">{formatCapacity(drone.capacity)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Battery className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-sm">{formatBattery(drone.battery)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Badge variant="default" className={`px-2 py-1 text-xs font-medium ${getStatusColor(drone.status)} text-white`}>
                          {DRONE_STATUS_LABEL[drone.status] || drone.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(drone)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1.5 rounded-md">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(drone)} className="bg-amber-50 hover:bg-amber-100 text-amber-600 px-2 py-1.5 rounded-md">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleChangeStatus(drone)} className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-1.5 rounded-md">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                <div className="text-sm text-gray-600 font-medium">Hiển thị trang {currentPage} trên {totalPages} (Tổng: {totalItems} drone)</div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1">Prev</Button>
                  <Button variant="ghost" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1">Next</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chi tiết Drone</DialogTitle>
              <DialogDescription>Thông tin chi tiết về drone</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <div className="flex justify-between"><strong>Mã ID:</strong><span className="text-gray-700">{selectedDrone?.droneId}</span></div>
              <div className="flex justify-between"><strong>Model:</strong><span className="text-gray-700">{selectedDrone?.model}</span></div>
              <div className="flex justify-between"><strong>Sức chứa:</strong><span className="text-gray-700">{formatCapacity(selectedDrone?.capacity)}</span></div>
              <div className="flex justify-between"><strong>Pin:</strong><span className="text-gray-700">{formatBattery(selectedDrone?.battery)}</span></div>
              <div className="flex justify-between"><strong>Trạng thái:</strong><Badge className={`${getStatusColor(selectedDrone?.status || '')} text-white`}>{DRONE_STATUS_LABEL[selectedDrone?.status || ''] || selectedDrone?.status}</Badge></div>
              <div className="flex justify-between"><strong>Restaurant ID:</strong><span className="text-gray-700 text-sm">{selectedDrone?.restaurantId}</span></div>
            </div>
            <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Đóng</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Drone</DialogTitle>
              <DialogDescription>Tạo drone mới cho nhà hàng</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <div><label className="text-sm font-medium">Model</label><Input value={formData.model || ''} onChange={(e) => setFormData((s) => ({ ...s, model: e.target.value }))} placeholder="VD: DJI Mavic 3" /></div>
              <div><label className="text-sm font-medium">Sức chứa (kg)</label><Input type="number" value={formData.capacity ?? 10} onChange={(e) => setFormData((s) => ({ ...s, capacity: Number(e.target.value) }))} min="1" step="0.5" /></div>
              <div><label className="text-sm font-medium">Pin (%)</label><Input type="number" value={formData.battery ?? 100} onChange={(e) => setFormData((s) => ({ ...s, battery: Number(e.target.value) }))} min="0" max="100" /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsCreateDialogOpen(false)} variant="ghost">Hủy</Button>
              <Button onClick={handleCreate}>Tạo Drone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập nhật Drone</DialogTitle>
              <DialogDescription>Chỉnh sửa thông tin drone</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <div><label className="text-sm font-medium">Model</label><Input value={formData.model || ''} onChange={(e) => setFormData((s) => ({ ...s, model: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Sức chứa (kg)</label><Input type="number" value={formData.capacity ?? 10} onChange={(e) => setFormData((s) => ({ ...s, capacity: Number(e.target.value) }))} min="1" step="0.5" /></div>
              <div><label className="text-sm font-medium">Pin (%)</label><Input type="number" value={formData.battery ?? 100} onChange={(e) => setFormData((s) => ({ ...s, battery: Number(e.target.value) }))} min="0" max="100" /></div>
              <div><label className="text-sm font-medium">Trạng thái</label><Select value={formData.status || 'AVAILABLE'} onValueChange={(value) => setFormData((s) => ({ ...s, status: value }))}><SelectTrigger className="w-full"><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger><SelectContent>{DRONE_STATUS_OPTIONS.map((option) => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent></Select></div>
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
