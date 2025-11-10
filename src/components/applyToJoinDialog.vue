<template>
  <!-- 使用原生HTML实现弹窗，替代u-popup组件 -->
  <div v-if="show" class="dialog-overlay" @click.self="closeDialog">
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>申请加入团队</h3>
        <button class="close-button" @click="closeDialog">×</button>
      </div>
      <div class="dialog-body">
        <div class="input-title">请输入申请理由：</div>
        <textarea 
          v-model="inputValue" 
          class="apply-textarea"
          placeholder="写点你的加入意愿吧~"
          rows="4"
        ></textarea>
      </div>
      <div class="input-actions">
        <button class="dialog-btn cancel" @click="cancel">取消</button>
        <button class="dialog-btn confirm" @click="submitJoin">提交</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { applyToJoin } from '../api/api';

const props = defineProps({
  show: Boolean, // 控制弹窗显示
  teamId: String, // 从父组件接收 teamId
});

const emit = defineEmits(['update:show']); // 用于触发父组件的 update:show 事件

const inputValue = ref(''); // 申请理由的输入值

// 关闭弹窗并触发 update:show
const closeDialog = () => {
  emit('update:show', false);  // 设置 show 为 false 来关闭弹窗
};

// 取消按钮
const cancel = () => {
  closeDialog();
};

// 提交申请
const submitJoin = async () => {
  try {
    const teamId = props.teamId; // 使用接收到的 teamId
    const reason = inputValue.value?.trim(); // 使用 inputValue 作为加入理由
    if (!teamId) {
      alert('团队信息丢失，请稍后再试');
      return;
    }
    if (!reason) {
      alert('请输入加入理由');
      return;
    }

    console.log('提交中...');
    await applyToJoin(teamId, reason); // 提交申请
    alert('申请成功，等待审核');
    closeDialog(); // 提交成功后关闭弹窗
  } catch (error) {
    console.error('申请失败', error);
    alert('申请失败，请稍后重试');
  } finally {
    console.log('加载完成');
  }
};
</script>

<style scoped>
/* 弹窗遮罩层 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

/* 弹窗内容 */
.dialog-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 弹窗头部 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f5f5f5;
  color: #666;
}

/* 弹窗主体 */
.dialog-body {
  padding: 20px;
}

.input-title {
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
  font-weight: 500;
}

/* 申请理由输入框 */
.apply-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.apply-textarea:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 操作按钮区域 */
.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;
  background-color: #fafafa;
}

.dialog-btn {
  padding: 8px 24px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.cancel {
  background-color: #f5f5f5;
  color: #606266;
}

.cancel:hover {
  background-color: #e6e6e6;
}

.confirm {
  background-color: #409eff;
  color: white;
}

.confirm:hover {
  background-color: #66b1ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-content {
    width: 95%;
    margin: 20px;
  }
  
  .input-actions {
    flex-direction: column-reverse;
  }
  
  .dialog-btn {
    width: 100%;
    padding: 12px 0;
  }
}
</style>
