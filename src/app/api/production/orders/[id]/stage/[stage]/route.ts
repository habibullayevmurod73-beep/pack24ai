import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string; stage: string }> }
) {
    try {
        const { id, stage } = await params; // id is workOrderId
        const body = await request.json();
        const { status, operator, progress } = body; // status: pending, in_progress, completed

        const workOrderId = parseInt(id);

        // Find the specific stage record
        const currentStageRecord = await prisma.workOrderStage.findFirst({
            where: {
                workOrderId,
                stage
            }
        });

        if (!currentStageRecord) {
            return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
        }

        // Update Stage
        await prisma.workOrderStage.update({
            where: { id: currentStageRecord.id },
            data: {
                status: status || currentStageRecord.status,
                operator: operator || currentStageRecord.operator,
                startedAt: status === 'in_progress' && !currentStageRecord.startedAt ? new Date() : undefined,
                completedAt: status === 'completed' ? new Date() : undefined
            }
        });

        // Update Parent Work Order
        let newProgress = 0;
        let newCurrentStage = stage;
        let newStatus = 'in_progress';

        // Calculate simplified progress based on completed stages
        const stages = ['gofra', 'pechat', 'yiguv', 'qc'];
        const stageIndex = stages.indexOf(stage);

        if (status === 'completed') {
            // Move to next stage if available
            if (stageIndex < stages.length - 1) {
                newCurrentStage = stages[stageIndex + 1];
            } else {
                newStatus = 'completed';
            }
        }

        // Calculate overall progress (Rough estimate: each stage is 25%)
        // Real app would sum up actual progress
        const completedStages = await prisma.workOrderStage.count({
            where: { workOrderId, status: 'completed' }
        });
        newProgress = (completedStages / stages.length) * 100;
        if (progress) newProgress = parseInt(progress); // Manual override if provided

        const updatedOrder = await prisma.workOrder.update({
            where: { id: workOrderId },
            data: {
                progress: newProgress,
                currentStage: newCurrentStage,
                status: newStatus === 'completed' ? 'completed' : 'in_progress'
            },
            include: { stages: true }
        });

        return NextResponse.json(updatedOrder);

    } catch (error) {
        console.error('Stage update error:', error);
        return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 });
    }
}
