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
	// 目标值
	$this.selectStatus = true;
	// 框选状态
	$this.rangeStatus = false;
	// 
	$this.indexRange = [-1, -1];
};
/**************************************************************************************************************/
// 配置参数
VSelectMultiple.prototype.options = {
	// 主题风格
	theme: 'default',
	// 下拉菜单不出现滚动条最大选项个数
	size: 4,
	// 美化节点宽度
	width: 'auto',
	// 下拉菜单最大高度
	height: 'auto',
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
	// 设置模拟对象尺寸
	$this.setSize();
	// 选中默认值
	$this.initSelected();
};
/**************************************************************************************************************/
// 创建多选模拟对象
VSelectMultiple.prototype.create = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	// 框选事件
	$elem.doc
		.on('mousedown', function(e) {
			// 焦点变化
			if (!$(e.target).is($elem.mimic) && !$(e.target).parents('.vui-selectMultiple').is($elem.mimic)) {
				$elem.mimic.removeClass('vui-selectMultiple-focus vui-' + opts.theme + '-selectMultiple-focus');
			}
		})
		.on('mouseup', function(e) {
			// 确认选择
			if (true === $this.rangeStatus) {
				$this.rangeStatus = false;
				$this.setSelected();
			}
		});
	// 创建模拟对象
	$elem.mimic = $('<div>')
		.VDisableSelection()
		.addClass('vui-selectMultiple vui-' + opts.theme + '-selectMultiple')
		.attr('title', $elem.original.attr('title'))
		.attr('tabindex', $elem.original.attr('tabindex') || 0)
		.on('mousedown focus', function(e) {
			$(this).addClass('vui-selectMultiple-focus vui-' + opts.theme + '-selectMultiple-focus');
		})
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
	if ($elem.original.children('option').length > 0) {
		$elem.options.appendTo($elem.mimic);
	}
	// 创建选项
	$elem.original.children('option').each(function() {
		var $option = $(this);
		var $item = $('<div>')
			.addClass('vui-selectMultiple-item')
			.on('mousedown', function(e) {
				e.preventDefault();
				$this.rangeStatus = true;
				if (true === e.shiftKey) {
					if (Math.min.apply(null, $this.indexRange) < 0) {
						$this.selectStatus = true;
						$this.indexRange[0] = $(this).index();
					}
				} else {
					$this.selectStatus = !$option.prop('selected');
					$this.indexRange[0] = $(this).index();
				}
				$this.indexRange[1] = $(this).index();
				$this.setRange();
			})
			.on('mouseenter', function(e) {
				if (true === $this.rangeStatus) {
					$this.indexRange[1] = $(this).index();
					$this.setRange();
				}
			})
			.on('dblclick', function(e) {
				$elem.original.children('option').prop('selected', false);
				$this.selectStatus = true;
				$this.indexRange = [$(this).index(), $(this).index()];
				$this.setRange();
				$this.setSelected();
			})
			.hover(function() {
				if (false === $this.rangeStatus && false === $(this).hasClass('vui-selectMultiple-selected')) {
					$(this).addClass('vui-selectMultiple-item-mouseover');
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
// 初始化菜单选中情况
VSelectMultiple.prototype.initSelected = function() {
	var $this = this,
		$elem = $this.elem;
	$elem.original.children('option').each(function() {
		$elem.options.children('.vui-selectMultiple-item').eq($(this).index()).toggleClass('vui-selectMultiple-selected', $(this).prop('selected'));
		if (true === $(this).prop('selected')) {
			$this.indexRange = [$(this).index(), $(this).index()];
		}
	});
}
/**************************************************************************************************************/
// 模拟选中
VSelectMultiple.prototype.setRange = function() {
	var $this = this,
		$elem = $this.elem,
		start, end;
	start = Math.min.apply(null, $this.indexRange);
	end = Math.max.apply(null, $this.indexRange);
	$elem.options.children('.vui-selectMultiple-item').each(function() {
		if ($(this).index() >= start && $(this).index() <= end) {
			$(this).toggleClass('vui-selectMultiple-selected', $this.selectStatus)
		} else {
			$(this).toggleClass('vui-selectMultiple-selected', $elem.original.children('option').eq($(this).index()).prop('selected'));
		}
	});
};
/**************************************************************************************************************/
// 选中行为
VSelectMultiple.prototype.setSelected = function() {
	var $this = this,
		$elem = $this.elem;
	$elem.options.children('.vui-selectMultiple-item').each(function() {
		$elem.original.children('option').eq($(this).index()).prop('selected', $(this).hasClass('vui-selectMultiple-selected'));
	});
	$elem.original.trigger('change');
};
/**************************************************************************************************************/
// 设置下拉菜单尺寸，设置美化节点宽度
VSelectMultiple.prototype.setSize = function() {
	var $this = this,
		$elem = $this.elem,
		opts = $this.options;
	if ($elem.original.children('option').length <= 0) {
		return;
	}
	var optionsWidth, optionsHeight, itemHeight, mimicWidth, mimicPatch, optionsPatch, $firstItem, maxHeight, itemPatch, textPatch, scrollWidth = 0;
	// 第一个选项
	$firstItem = $elem.options.children('.vui-selectMultiple-item:first');
	// 原始菜单尺寸
	optionsWidth = $elem.options.width();
	//	optionsHeight = $elem.options.height();
	// 单个选项尺寸
	itemHeight = $firstItem.outerHeight(true);
	// 设置菜单高度
	$elem.options.css({
		height: opts.height === 'auto' ? opts.size * itemHeight : opts.height,
		overflowY: 'scroll'
	});
	// 滚动条宽度
	scrollWidth = !+[1, ] ? 16 : $elem.options.width() - optionsWidth;
	// 选项宽度补丁
	itemPatch = $firstItem.outerWidth(true) - $firstItem.width();
	// 菜单补丁
	optionsPatch = $elem.options.outerWidth() - $elem.options.width();
	// 菜单宽度
	optionsWidth += scrollWidth;
	// 美化节点最大宽度
	if (opts.width !== 'auto') {
		optionsWidth = opts.width - optionsPatch > optionsWidth ? optionsWidth: opts.width - optionsPatch ;
	}
	// 设置菜单宽度
	$elem.options.width(optionsWidth);
	// 设置选项宽度
	$elem.options.children('.vui-selectMultiple-item').width(optionsWidth - itemPatch - scrollWidth);
};