import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo-data'

interface UpdateCategoryRequest {
  name?: string
  description?: string
  color?: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json() as UpdateCategoryRequest

    // デモモードチェック
    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        category: {
          id,
          ...body,
          updated_at: new Date().toISOString()
        },
        message: 'デモモード: カテゴリを更新しました'
      })
    }

    const supabase = await createClient()

    // 現在のユーザーを取得
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // カテゴリの存在確認と権限チェック
    const { data: category, error: categoryError } = await supabase
      .from('project_categories')
      .select('*')
      .eq('id', id)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // システムカテゴリは編集不可
    if (category.is_system) {
      return NextResponse.json(
        { error: 'Cannot modify system categories' },
        { status: 403 }
      )
    }

    // 作成者のみ編集可能
    if (category.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied. You can only edit your own categories.' },
        { status: 403 }
      )
    }

    // カテゴリを更新
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const { data: updatedCategory, error: updateError } = await supabase
      .from('project_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      category: updatedCategory,
      message: 'Category updated successfully'
    })

  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // デモモードチェック
    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        message: 'デモモード: カテゴリを削除しました'
      })
    }

    const supabase = await createClient()

    // 現在のユーザーを取得
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // カテゴリの存在確認と権限チェック
    const { data: category, error: categoryError } = await supabase
      .from('project_categories')
      .select('*')
      .eq('id', id)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // システムカテゴリは削除不可
    if (category.is_system) {
      return NextResponse.json(
        { error: 'Cannot delete system categories' },
        { status: 403 }
      )
    }

    // 作成者のみ削除可能
    if (category.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied. You can only delete your own categories.' },
        { status: 403 }
      )
    }

    // このカテゴリを使用しているプロジェクトがあるかチェック
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('category', id)
      .eq('user_id', user.id)

    if (countError) {
      throw countError
    }

    if (count && count > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete category. ${count} project(s) are using this category.`,
          projects_count: count
        },
        { status: 409 }
      )
    }

    // カテゴリを削除
    const { error: deleteError } = await supabase
      .from('project_categories')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })

  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}