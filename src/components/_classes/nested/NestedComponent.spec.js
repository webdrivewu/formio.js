'use strict';
import NestedComponent from './NestedComponent';
import Harness from '../../../../test/harness';
import assert from 'power-assert';
import each from 'lodash/each';

let component = null;

describe('NestedComponent class', () => {
  it('Should create a new NestedComponent class', () => {
    return Harness.testCreate(NestedComponent, {
      // key: 'nested',
      components: [
        {
          type: 'textfield',
          key: 'firstName',
          input: true
        },
        {
          type: 'textfield',
          key: 'lastName',
          input: true
        }
      ]
    }).then((_component) => {
      component = _component;
      Harness.testElements(component, 'input[name="data[firstName]"]', 1);
      Harness.testElements(component, 'input[name="data[lastName]"]', 1);
    });
  });

  it('Should be able to add new components', (done) => {
    component.addComponent({
      type: 'email',
      key: 'email',
      input: true
    });
    component.redraw();
    Harness.testElements(component, 'input[name="data[email]"]', 1);
    done();
  });

  it('Should be able to set data within the components.', (done) => {
    const value = {
      firstName: 'Joe',
      lastName: 'Smith',
      email: 'joe@example.com'
    };
    component.setValue(value);
    assert.deepEqual(component.getValue(), value);
    each(component.components, (component) => {
      assert.equal(component.getValue(), value[component.key]);
    });
    done();
  });

  it('Should create nested visibility elements.', () => {
    return Harness.testCreate(NestedComponent, {
      components: [
        {
          type: 'checkbox',
          key: 'showPanel',
          label: 'Show Panel',
          input: true
        },
        {
          type: 'panel',
          key: 'parent',
          title: 'Parent Panel',
          conditional: {
            json: { var: 'data.showPanel' }
          },
          components: [
            {
              type: 'checkbox',
              key: 'showChild',
              label: 'Child 1',
              input: true,
              conditional: {
                json: { var: 'data.showChild' }
              }
            },
            {
              type: 'checkbox',
              key: 'forceParent',
              label: 'Child 2',
              input: true,
              conditional: {
                json: { var: 'data.forceParent' },
              }
            }
          ]
        }
      ]
    }).then((comp) => {
      // Make sure we built the components tree.
      assert.equal(comp.components.length, 2);
      assert.equal(comp.components[1].components.length, 2, 'two');
      const data = {
        showPanel: true,
        showChild: false,
        forceParent: false
      };

      comp.setValue(data);
      comp.checkConditions(data);
      assert.equal(comp.components[1]._visible, true);
      assert.equal(comp.components[1].components[0]._visible, false);
      assert.equal(comp.components[1].components[1]._visible, false);

      data.showChild = true;
      comp.setValue(data);
      comp.checkConditions(data);
      assert.equal(comp.components[1]._visible, true);
      assert.equal(comp.components[1].components[0]._visible, true);
      assert.equal(comp.components[1].components[1]._visible, false);

      data.showPanel = false;
      comp.setValue(data);
      comp.checkConditions(data);
      assert.equal(comp.components[1]._visible, false);
      assert.equal(comp.components[1].components[0]._visible, true);
      assert.equal(comp.components[1].components[1]._visible, false);

      // overrideParent is depricated.
      data.forceParent = true;
      comp.setValue(data);
      comp.checkConditions(data);
      assert.equal(comp.components[1]._visible, false);
      assert.equal(comp.components[1].components[0]._visible, true);
      assert.equal(comp.components[1].components[1]._visible, true);
    });
  });
});