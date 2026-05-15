import { prisma } from '@/lib/prisma';

export async function createAuditLog(params: {
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        userId: params.userId,
        ipAddress: params.ipAddress
      }
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

export async function createAdminAction(params: {
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  adminId: string;
}) {
  try {
    await prisma.adminAction.create({
      data: {
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        reason: params.reason,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        adminId: params.adminId
      }
    });
  } catch (error) {
    console.error('Admin action log error:', error);
  }
}
