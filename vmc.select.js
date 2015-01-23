;
(function($, undefined) {
/**************************************************************************************************************/
$.fn.VDisableSelection = function() {
	$(this)
		.css('MozUserSelect', 'none')
		.attr('unselectable', 'on')
		.on('selectstart', function() {
			return false;
		});
	return $(this);
};
/**************************************************************************************************************/
$.fn.VSelect = function() {
	var param = arguments;
	return this.each(function() {
		var $this = $(this);
		if ($this.prop('multiple') === true) {
			$this.data('mimic', new VSelectMultiple($this, param[0]));
			$this.data('mimic').init();
		} else {
			switch (param[0]) {
			case 'destroy':
				if (typeof($this.data('mimic')) === 'object') {
					$this.data('mimic').destroy();
				}
				break;
			case 'insert':
				if (typeof($this.data('mimic')) === 'object') {
					$this.data('mimic').insert(param[1], param[2], param[3]);
				}
				break;
			case 'remove':
				if (typeof($this.data('mimic')) === 'object') {
					$this.data('mimic').remove(param[1], param[2]);
				}
				break;
			default:
				if (typeof($this.data('mimic')) === 'object') {
					$this.data('mimic').rebuild();
				} else {
					$this.data('mimic', new VSelect($this, param[0]));
					$this.data('mimic').init();
				}
			}
		}
	});
};
/**************************************************************************************************************/

































/**************************************************************************************************************/
// 构造函数
var VSelectMultiple = function(original, options) {
	var $this = this,
		opts = $this.options;
	$this.options = $.extend({}, opts, options);
	// 定义DOM元素对象
	$this.elem = {};
	$this.elem.win = $(window);
	$this.elem.doc = $(document);
	$this.elem.body = $('body');
	$this.elem.original = original;
	// 更新配置
	if (typeof($this.elem.original.attr('theme')) !== 'undefined') {
		$this.options.theme = $this.elem.original.attr('theme');
	}
	if (typeof($this.elem.original.attr('size')) !== 'undefined') {
		$this.options.size = parseInt($this.elem.original.attr('size'), 10);
	}
	if (typeof($this.elem.original.attr('width')) !== 'undefined') {
		$this.options.width = parseInt($this.elem.original.attr('width'), 10);
	}
	if (typeof($this.elem.original.attr('height')) !== 'undefined') {
		$this.options.height = parseInt($this.elem.original.attr('height'), 10);
	}

	// 框选范围
	$this.selectRange = [0, 0];
	// 选择状态
	$this.selectStatus = false;
	// 框选状态
	$this.rangeStatus = false;

	//$this.selected = true;
};
/**************************************************************************************************************/
// 配置参数
VSelectMultiple.prototype.options = {
	// 主题风格
	theme: 'default',
	// 下拉菜单不出现滚动条最大选项个数
	size: 10,
	// 美化节点宽度
	width: 'auto',
	// 下拉菜单最大高度
	height: 'auto',
	// 支持键盘选择
	supportKeyboard: true
};
/**************************************************************************************************************/
// 初始化
VSelectMultiple.prototype.init = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	// 隐藏原始节点
	$elem.original.hide();
	// 创建模拟对象
	$this.create();
	// 键盘选择
//	$this.keyboard();
	// 设置模拟对象尺寸
	$this.setSize();
	// 选中默认值
//	$this.setSelected();
	
	
};


/**************************************************************************************************************/
// 创建多选模拟对象
VSelectMultiple.prototype.create = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	// 创建模拟对象
	$elem.mimic = $('<div>')
		.VDisableSelection()
		.addClass('vui-selectMultiple vui-' + opts.theme + '-selectMultiple')
		.attr('title', $elem.original.attr('title'))
		.attr('tabindex', $elem.original.attr('tabindex') || 0)
		.on('mouseenter', function(e) {
			$(this).addClass('vui-selectMultiple-mouseover vui-' + opts.theme + '-selectMultiple-mouseover');
		})
		.on('mouseleave', function(e) {
			$(this).removeClass('vui-selectMultiple-mouseover vui-' + opts.theme + '-selectMultiple-mouseover');
		})
		.insertAfter($elem.original);
	// 创建菜单
	$elem.options = $('<div>')
		.addClass('vui-selectMultiple-options');
	// 无选项时不显示下拉菜单
	if ($elem.original.find('option').length > 0) {
		$elem.options.appendTo($elem.mimic);
	}
	// 框选事件
	$elem.doc
		.on('mouseup', function(e){
			if($this.rangeStatus === true) {
				$this.range(e);
				$this.setSelected();
			}
			$this.rangeStatus = false;
			
		})
		.on('mousemove', function(e){
			if($this.rangeStatus === true) {
				$this.range(e);
			}
		});

	// 创建选项
	$elem.original.find('option').each(function() {
		var $option = $(this);
		var $item = $('<div>')
			.addClass('vui-selectMultiple-item')
			.on('mousedown', function(e) {
				$(this).toggleClass('vui-selectMultiple-selected');
				e.preventDefault();
				$this.selectRange[0] = e.pageY;
				$this.rangeStatus = true;	
				$this.selectStatus = !$option.prop('selected');
				
			})
			.hover(function() {
				if(false === $this.rangeStatus) {
					if (!$(this).hasClass('vui-selectMultiple-selected')) {
						$(this).addClass('vui-selectMultiple-item-mouseover');
					}
				}
			}, function() {
				$(this).removeClass('vui-selectMultiple-item-mouseover');
			})
			.appendTo($elem.options);
		var $itemIcon = $('<div>')
			.addClass('vui-selectMultiple-item-icon')
			.appendTo($item);
		var $itemText = $('<div>')
			.addClass('vui-selectMultiple-item-text')
			.text($option.text())
			.appendTo($item);
	});
	
	
	
};
/**************************************************************************************************************/
// 框选行为
VSelectMultiple.prototype.range = function(e) {
	var $this = this,
		$elem = $this.elem,
		a1, a2, b1, b2;
	$this.selectRange[1] = e.pageY;
	a1 = Math.min.apply(null, $this.selectRange);
	a2 = Math.max.apply(null, $this.selectRange);
	$elem.options.children('.vui-selectMultiple-item').each(function() {
		var index = $(this).index();
		b1 = $(this).offset().top;
		b2 = b1 + $(this).outerHeight();
		if (a1 > b2 || a2 < b1) {
			if (true === $elem.original.children('option').eq(index).prop('selected')) {
				$(this).addClass('vui-selectMultiple-selected');
			} else {
				$(this).removeClass('vui-selectMultiple-selected');
			}
		} else {
			if ($this.selectStatus === true) {
				$(this).addClass('vui-selectMultiple-selected');
			} else {
				$(this).removeClass('vui-selectMultiple-selected');
			}
		}
	});
};
/**************************************************************************************************************/
// 选中行为
VSelectMultiple.prototype.setSelected = function() {
	var $this = this,
		$elem = $this.elem;
	$elem.options.find('.vui-selectMultiple-item').each(function() {
		if ($(this).hasClass('vui-selectMultiple-selected')) {
			$elem.original.children('option:eq(' + $(this).index() + ')').prop('selected', true);
		} else {
			$elem.original.children('option:eq(' + $(this).index() + ')').prop('selected', false);
		}
	});
	$elem.original.trigger('change');
};
/**************************************************************************************************************/
// 设置下拉菜单尺寸，设置美化节点宽度
VSelectMultiple.prototype.setSize = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	// 选项数量
	var optionsCount = $elem.original.find('option').length;
	if (optionsCount <= 0) {
		return;
	}
	var optionsWidth, optionsHeight, itemHeight, mimicWidth, mimicPatch, optionsPatch, $firstItem, maxHeight, itemPatch, textPatch, scrollWidth = 0;
	// 最大宽度的选项
	$firstItem = $elem.options.children(':first');
	// 原始菜单尺寸
	optionsWidth = $elem.options.width();
	optionsHeight = $elem.options.height();
	// 单个选项尺寸
	itemHeight = optionsHeight / optionsCount;
	// 菜单最大高度
	maxHeight = opts.height === 'auto' ? opts.size * itemHeight : opts.height;
	// 菜单超出最大高度行为
	if (optionsHeight > maxHeight) {
		$elem.options.css({
			height: maxHeight,
			overflowY: 'scroll'
		});
		// 滚动条宽度
		scrollWidth = !+[1, ] ? 16 : $elem.options.width() - optionsWidth;
	}


	// 选项宽度补丁
	itemPatch = $firstItem.outerWidth(true) - $firstItem.width();
	
	// 菜单宽度
	optionsWidth += scrollWidth;
	// 菜单补丁
	optionsPatch = $elem.options.outerWidth() - $elem.options.width();

	// 美化节点最大宽度
	if (opts.width !== 'auto') {
		optionsWidth = opts.width - optionsPatch > optionsWidth ? opts.width - optionsPatch : optionsWidth;
	}

	// 设置菜单宽度
	$elem.options.width(optionsWidth);
	// 设置选项宽度
	$elem.options.find('.vui-selectMultiple-item').width(optionsWidth - itemPatch - scrollWidth);
};
/**************************************************************************************************************/
/**************************************************************************************************************/


















































/**************************************************************************************************************/
/**************************************************************************************************************/
// 构造函数
var VSelect = function(original, options) {
	var $this = this,
		opts = $this.options;
	$this.options = $.extend({}, opts, options);
	// 定义DOM元素对象
	$this.elem = {};
	$this.elem.win = $(window);
	$this.elem.doc = $(document);
	$this.elem.body = $('body');
	$this.elem.original = original;
	// 更新配置
	if (typeof($this.elem.original.attr('theme')) !== 'undefined') {
		$this.options.theme = $this.elem.original.attr('theme');
	}
	if (typeof($this.elem.original.attr('size')) !== 'undefined') {
		$this.options.size = parseInt($this.elem.original.attr('size'), 10);
	}
	if (typeof($this.elem.original.attr('width')) !== 'undefined') {
		$this.options.width = parseInt($this.elem.original.attr('width'), 10);
	}
	if (typeof($this.elem.original.attr('height')) !== 'undefined') {
		$this.options.height = parseInt($this.elem.original.attr('height'), 10);
	}
	// 是否使用动画效果
	$this.animate = true;
	// 下拉菜单显示状态
	$this.status = false;
};
/**************************************************************************************************************/
// 配置参数
VSelect.prototype.options = {
	// 主题风格
	theme: 'default',
	// 下拉菜单不出现滚动条最大选项个数
	size: 10,
	// 美化节点宽度
	width: 'auto',
	// 下拉菜单最大高度
	height: 'auto',
	// 支持键盘选择
	supportKeyboard: true,
	// 下拉过程动画效果
	easingShow: 'swing',
	// 收起过程动画效果
	easingHide: 'swing',
	// 下拉过程动画时长（毫秒）
	durationShow: 100,
	// 收起过程动画时长（毫秒）
	durationHide: 50
};
/**************************************************************************************************************/
// 初始化
VSelect.prototype.init = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	// 隐藏原始节点
	$elem.original.hide();
	// 创建模拟对象
	$this.create();
	// 键盘选择
	$this.keyboard();
	// 设置模拟对象尺寸
	$this.setSize();
	// 隐藏下拉菜单
	$elem.options.hide();
	$this.status = false;
	// 选中默认值
	$this.setSelected();
	// 滚动或者窗口尺寸变化时重置下拉菜单位置
	$elem.win.on('scroll resize', function() {
		true === $this.status && $this.setPos();
	});
	// 点击任意位置关闭下拉菜单
	$elem.doc.on('click', function(e) {
		if ($this.status && !$elem.mimic.is(e.target) && !$elem.text.is(e.target) && !$elem.icon.is(e.target)) {
			$this.hide();
		}
	});
};
/**************************************************************************************************************/
// 创建模拟对象
VSelect.prototype.create = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	// 创建模拟对象
	$elem.mimic = $('<div>')
		.VDisableSelection()
		.addClass('vui-select vui-' + opts.theme + '-select')
		.attr('title', $elem.original.attr('title'))
		.attr('tabindex', $elem.original.attr('tabindex') || 0)
		.on('mousedown', function(e) {
			if (true === $this.status) {
				$this.hide();
			} else {
				$this.setPos();
				$this.show();
			}
		})
		.on('mouseenter', function(e) {
			if (false === $this.status) {
				$(this).addClass('vui-select-mouseover vui-' + opts.theme + '-select-mouseover');
			}
		})
		.on('mouseleave', function(e) {
			$(this).removeClass('vui-select-mouseover vui-' + opts.theme + '-select-mouseover');
		})
		.insertAfter($elem.original);
	// 创建模拟对象文字节点
	$elem.text = $('<div>')
		.addClass('vui-select-text')
		.appendTo($elem.mimic);
	// 创建模拟对象图标节点
	$elem.icon = $('<div>')
		.addClass('vui-select-icon')
		.appendTo($elem.mimic);
	// 创建下拉菜单
	$elem.options = $('<div>')
		.addClass('vui-select-options vui-' + opts.theme + '-select-options')
		.css('margin', 0);
	// 无选项时不显示下拉菜单
	if ($elem.original.find('option').length > 0) {
		$elem.options.appendTo($elem.body);
	}
	// 创建菜单容器
	$elem.optionsWrap = $('<div>')
		.addClass('vui-select-options-wrap')
		.appendTo($elem.options);
	// 创建选项
	$elem.original.find('option').each(function() {
		var $option = $(this);
		var $item = $('<div>')
			.addClass('vui-select-item')
			.css('margin', 0)
			.text($option.text())
			.on('mousedown', function(e) {
				e.preventDefault();
			})
			.on('mouseup', function(e) {
				$option.prop('selected', true);
				$this.setSelected();
				$elem.original.trigger('change');
			})
			.hover(function() {
				if (!$(this).hasClass('vui-select-selected')) {
					$(this).addClass('vui-select-options-mouseover');
				}
			}, function() {
				$(this).removeClass('vui-select-options-mouseover');
			})
			.appendTo($elem.optionsWrap);
	});
};
/**************************************************************************************************************/
// 选中行为
VSelect.prototype.setSelected = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	$elem.original.children('option').each(function() {
		var $item = $(this);
		if ($item.prop('selected') === true) {
			$elem.text.text($item.text());
			$elem.optionsWrap.children('.vui-select-item:eq(' + $item.index() + ')')
				.removeClass('vui-select-options-mouseover')
				.addClass('vui-select-selected');
		} else {
			$elem.optionsWrap.children('.vui-select-item:eq(' + $item.index() + ')')
				.removeClass('vui-select-selected');
		}
	});
};
/**************************************************************************************************************/
// 显示下拉菜单
VSelect.prototype.show = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	$elem.mimic.addClass('vui-select-mousedown vui-' + opts.theme + '-select-mousedown');
	$this.status = true;
	$elem.options.stop();
	if (true === $this.animate) {
		$elem.options.slideDown({
			duration: opts.durationShow,
			easing: opts.easingShow,
			queue: false,
			done: function() {
				$this.setPos();
			}
		});
	} else {
		$elem.options.fadeIn({
			duration: opts.durationShow,
			queue: false,
			done: function() {
				$this.setPos();
			}
		});
	}
};
/**************************************************************************************************************/
// 隐藏下拉菜单
VSelect.prototype.hide = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	$elem.mimic.removeClass('vui-select-mousedown vui-' + opts.theme + '-select-mousedown');
	$this.status = false;
	$elem.options.stop();
	if (true === $this.animate) {
		$elem.options.slideUp({
			duration: opts.durationHide,
			easing: opts.easingHide,
			queue: false
		});
	} else {
		$elem.options.fadeOut({
			duration: opts.durationHide,
			queue: false
		});
	}
};
/**************************************************************************************************************/
// 设置下拉菜单位置
VSelect.prototype.setPos = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options,
		top, mimicHeight, mimicOffsetTop, optionsHeight, optionsInnerHeight, upper, below;
	mimicHeight = $elem.mimic.outerHeight();
	mimicOffsetTop = $elem.mimic.offset().top;
	optionsHeight = $elem.options.outerHeight();
	optionsInnerHeight = $elem.options.innerHeight();
	upper = mimicOffsetTop - $elem.win.scrollTop();
	below = $elem.win.height() - upper - mimicHeight;
	if (below < optionsHeight && upper >= optionsHeight) {
		$this.animate = false;
		top = mimicOffsetTop - optionsHeight + (optionsHeight - optionsInnerHeight) / 2;
	} else {
		$this.animate = true;
		top = mimicOffsetTop + mimicHeight - (optionsHeight - optionsInnerHeight) / 2;
	}
	$elem.options.css({
		'top': top,
		'left': $elem.mimic.offset().left
	});
};
/**************************************************************************************************************/
// 设置下拉菜单尺寸，设置美化节点宽度
VSelect.prototype.setSize = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	// 选项数量
	var optionsCount = $elem.original.find('option').length;
	if (optionsCount <= 0) {
		return;
	}
	var optionsWidth, optionsHeight, itemHeight, mimicWidth, mimicPatch, optionsPatch, $maxItem, maxHeight, itemPatch, textPatch, scrollWidth = 0;
	// 最大宽度的选项
	$maxItem = $this.getMaxItem($elem.optionsWrap);
	// 原始菜单尺寸
	optionsWidth = $elem.optionsWrap.width();
	optionsHeight = $elem.optionsWrap.height();
	// 单个选项尺寸
	itemHeight = optionsHeight / optionsCount;
	// 菜单最大高度
	maxHeight = opts.height === 'auto' ? opts.size * itemHeight : opts.height;
	// 菜单超出最大高度行为
	if (optionsHeight > maxHeight) {
		$elem.optionsWrap.css({
			height: maxHeight,
			overflowY: 'scroll'
		});
		// 滚动条宽度
		scrollWidth = !+[1, ] ? 16 : $elem.optionsWrap.width() - optionsWidth;
	}
	// 将最大宽度的选项文字添加在显示文本内以便测量美化节点最大宽度
	$elem.text.text($maxItem.text());
	// 选项宽度补丁
	itemPatch = $maxItem.outerWidth(true) - $maxItem.width();
	// 显示文本宽度补丁
	textPatch = $elem.text.outerWidth(true) - $elem.text.width();
	// 美化节点宽度
	mimicWidth = $elem.mimic.width();
	// 美化节点补丁
	mimicPatch = $elem.mimic.outerWidth() - $elem.mimic.width();
	// 菜单宽度
	optionsWidth += scrollWidth;
	// 菜单补丁
	optionsPatch = $elem.options.outerWidth() - $elem.options.width();
	// 保持菜单宽度等于美化节点宽度
	if (optionsWidth + optionsPatch > $elem.mimic.outerWidth()) {
		mimicWidth = optionsWidth + optionsPatch - mimicPatch;
	} else {
		optionsWidth = $elem.mimic.outerWidth() - optionsPatch;
	}
	// 美化节点最大宽度
	if (opts.width !== 'auto') {
		mimicWidth = opts.width - mimicPatch;
		optionsWidth = opts.width - optionsPatch > optionsWidth ? opts.width - optionsPatch : optionsWidth;
	}
	// 设置美化节点宽度
	$elem.mimic.width(mimicWidth);
	// 设置显示文本宽度
	$elem.text.width(mimicWidth - textPatch);
	// 设置菜单宽度
	$elem.optionsWrap.width(optionsWidth);
	// 设置选项宽度
	$elem.optionsWrap.find('.vui-select-item').width(optionsWidth - itemPatch - scrollWidth);
};
/**************************************************************************************************************/
// 键盘支持
VSelect.prototype.keyboard = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	if (true === opts.supportKeyboard) {
		$elem.mimic.on('keydown', function(e) {
			switch (e.which) {
			case 13:
				$this.enter();
				break;
			case 38:
				$this.prev();
				break;
			case 40:
				$this.next();
				break;
			}
		});
	}
};
/**************************************************************************************************************/
// 选中下一个选项
VSelect.prototype.next = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options,
		index = $elem.original.find('option:selected').index();
	index++;
	if (index >= $elem.original.find('option').length) {
		return;
	}
	$elem.optionsWrap.find('.vui-select-item:eq(' + index + ')').trigger('mouseup');
	$this.setPos();
};
/**************************************************************************************************************/
// 选中上一个选项
VSelect.prototype.prev = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options,
		index = $elem.original.find('option:selected').index();
	index--;
	if (index < 0) {
		return;
	}
	$elem.optionsWrap.find('.vui-select-item:eq(' + index + ')').trigger('mouseup');
	$this.setPos();
};
/**************************************************************************************************************/
// 选中当前鼠标指向的选项
VSelect.prototype.enter = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	$elem.optionsWrap.find('.vui-select-options-mouseover').trigger('mouseup');
	$this.hide();
};
/**************************************************************************************************************/
// 销毁
VSelect.prototype.destroy = function(){
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	$elem.original.show().removeData('mimic');
	$elem.mimic.remove();
	$elem.options.remove();
};
/**************************************************************************************************************/
// 重置
VSelect.prototype.rebuild = function(){
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	$elem.mimic.remove();
	$elem.options.remove();
	$this.create();
	$this.keyboard();
	$this.setSize();
	$elem.options.hide();
	$this.status = false;
	$this.setSelected();
};
/**************************************************************************************************************/
// 插入选项 text,value,selected
VSelect.prototype.insert = function() {
	var $this = this,
		$elem = $this.elem;
	arguments[2] = typeof(arguments[2]) === 'boolean' ? arguments[2] : false;
	var newOption = new Option(arguments[0], arguments[1]);
	$elem.original[0].options.add(newOption);
	if (true === arguments[2]) {
		$(newOption).prop('selected', true);
		$elem.original.trigger('change');
	}
	$this.rebuild();
};
/**************************************************************************************************************/
// 删除选项 key,type
VSelect.prototype.remove = function() {
	var $this = this,
		$elem = $this.elem,
		index = -2;
	arguments[1] = typeof(arguments[1]) == 'number' ? arguments[1] : 0;
	switch (arguments[1]) {
	case 0:
		index = $elem.original.find('option[value="' + arguments[0] + '"]:first').index();
		break;
	case 1:
		index = $elem.original.find('option[text="' + arguments[0] + '"]:first').index();
		break;
	case 2:
		index = arguments[0];
		break;
	case 3:
		index = $elem.original.find('option:selected').index();
		break;
	};
	if (index < 0) {
		return;
	}
	$elem.original[0].options.remove(index);
	$elem.original.trigger('change');
	$this.rebuild();
};
/**************************************************************************************************************/
// 获取最宽的选项
VSelect.prototype.getMaxItem = function($options) {
	var maxItem, maxWidth = 0;
	$options.find('.vui-select-item').each(function() {
		if ($(this).width() > maxWidth) {
			maxWidth = $(this).width();
			maxItem = $(this);
		}
	});
	return maxItem;
};
/**************************************************************************************************************/
})(jQuery);