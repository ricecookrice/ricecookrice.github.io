/**
 * ����ϵͳ - ���ز���Ԫ�غ͵�����Ϣ
 * ��������ʽ�汾�����ز���Ҫ��ʾ�Ĳ�������
 */

// ���ز���Ԫ�غ͵�����Ϣ�ĺ���
export function hideTestElements() {
    console.log('��ʼ���ز���Ԫ��...');

    // ����BuySystem���Լ�������ʾ��
    const buyTestElement = document.getElementById('debugHValue');
    if (buyTestElement) {
        const containerDiv = buyTestElement.parentElement;
        if (containerDiv) {
            containerDiv.style.display = 'none';
            console.log('������BuySystem���Լ�����');
        }
    }

    // ���ص���fֵ��ʾ��
    const debugFElement = document.getElementById('debugFValue');
    if (debugFElement) {
        const containerDiv = debugFElement.parentElement;
        if (containerDiv) {
            containerDiv.style.display = 'none';
            console.log('�����ص���fֵ��ʾ��');
        }
    }

    // ���ص���eֵ��ʾ��
    const debugEElement = document.getElementById('debugEValue');
    if (debugEElement) {
        const containerDiv = debugEElement.parentElement;
        if (containerDiv) {
            containerDiv.style.display = 'none';
            console.log('�����ص���eֵ��ʾ��');
        }
    }
    // ������ԴB��ʾ
    const resourceBElement = document.getElementById('resourceB');
    if (resourceBElement) {
        const bContainer = resourceBElement.closest('h1');
        if (bContainer) {
            bContainer.style.display = 'none';
            console.log('��������ԴB��ʾ');
        }
    }

    // ������ԴC��ʾ
    const resourceCElement = document.getElementById('resourceC');
    if (resourceCElement) {
        const cContainer = resourceCElement.closest('h1');
        if (cContainer) {
            cContainer.style.display = 'none';
            console.log('��������ԴC��ʾ');
        }
    }

    // �������ð�ť
    const resetButtons = document.querySelectorAll('button[onclick*="handleReset1"], button[onclick*="performReset"]');
    resetButtons.forEach(button => {
        button.style.display = 'none';
        console.log('���������ð�ť:', button.textContent);
    });

    // ���ز���ʱ����ʾ��ť
    const testTimeButton = document.querySelector('button[onclick*="testTimeDisplay"]');
    if (testTimeButton) {
        testTimeButton.style.display = 'none';
        console.log('�����ز���ʱ����ʾ��ť');
    }

    // ��������2��ʱ����ʾ
    const reset2TimeSpan = document.getElementById('reset2PlayTime');
    if (reset2TimeSpan) {
        const containerDiv = reset2TimeSpan.parentElement;
        if (containerDiv) {
            containerDiv.style.display = 'none';
            console.log('����������2��ʱ����ʾ');
        }
    }

    console.log('����Ԫ���������');
}
// Ĭ�ϵ������غ���
export default {
    hideTestElements
};