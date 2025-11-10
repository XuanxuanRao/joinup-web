<template>
	<view @click="handleClick">
        <slot>复制</slot>
    </view>
</template>
<script>
export default {
    name: "up-copy",
    props: {
        content: {
            type: String,
            default: ''
        },
		alertStyle: {
			type: String,
			default: 'toast'
		},
		notice: {
			type: String,
			default: '复制成功'
		}
    },
	emits: ['success'],
    methods: {
        handleClick() {
            let content = this.content;
			if (!content) {
				// 使用标准浏览器API替代uni.showToast
			alert('暂无');
			
				return false;
			}
            content = typeof content === 'string' ? content : content.toString() // 复制内容，必须字符串，数字需要转换为字符串
            /**
			* 小程序端 和 app端的复制逻辑
			*/
			let that = this;
            uni.setClipboardData({
                data: content,
                success: function() {
					if (that.alertStyle == 'modal') {
						// 使用标准浏览器API替代uni.showModal
			const result = confirm(that.notice);
			// confirm返回用户是否点击了确定按钮
			if (result) {
				// 用户确认后的处理逻辑
			}
					} else {
						// 使用标准浏览器API替代uni.showToast
			alert(that.notice);
				
					}
					that.$emit('success');
                },
                fail:function(){
                    uni.showToast({
                        title: '复制失败',
                        icon: 'none',
                        duration:3000,
                    });
                }
            });
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
